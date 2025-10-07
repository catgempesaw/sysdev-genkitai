import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { openAI } from "@genkit-ai/openai";

const ai = genkit({ plugins: [googleAI(), openAI()] });

// Part 2: Simple string in/out flow
export const studyPlanGenerator = ai.defineFlow(
  {
    name: "studyPlanGenerator",
    inputSchema: z.object({
      subject: z.string().min(1, "subject required"),
      model: z.string().optional(),
    }),
    outputSchema: z.object({ text: z.string() }),
  },
  async ({ subject, model }: { subject: string; model?: string }) => {
    const prompt = `You are an expert tutor. Given the subject "${subject}", suggest 3-5 concise study topics as a bullet list.`;
    const selectedModel = model?.trim() || "googleai/gemini-1.5-pro";
    const result = await ai.generate({ model: selectedModel, prompt });
    return { text: result.text ?? "No suggestions available." };
  }
);

// Part 4: Tooling and structured output
export type Resource = { title: string; url: string };
export type StudyPlan = { subject: string; topics: string[]; resource: Resource };

export const findEducationalLink = ai.defineTool(
  {
    name: "findEducationalLink",
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: z.object({ title: z.string(), url: z.string().url() }),
    description: "Find a relevant educational link for a topic.",
  },
  async ({ topic }: { topic: string }) => {
    const q = topic?.trim();
    if (!q) return { title: "Getting Started", url: "https://www.khanacademy.org" };
    const encoded = encodeURIComponent(q);
    return { title: `Intro to ${q}`, url: `https://www.youtube.com/results?search_query=${encoded}` };
  }
);

export const studyPlanGeneratorStructured = ai.defineFlow(
  {
    name: "studyPlanGeneratorStructured",
    inputSchema: z.object({
      subject: z.string().min(1),
      model: z.string().optional(),
    }),
    outputSchema: z.object({
      subject: z.string(),
      topics: z.array(z.string()),
      resource: z.object({ title: z.string(), url: z.string().url() }),
    }),
  },
  async ({ subject, model }: { subject: string; model?: string }) => {
    const prompt = `Return valid JSON with keys subject, topics (3-5 items), and resource {title,url}. subject must be "${subject}". Keep topics concise.`;
    const schema = z.object({
      subject: z.string(),
      topics: z.array(z.string()),
      resource: z.object({ title: z.string(), url: z.string().url() }),
    });
    const selectedModel = model?.trim() || "googleai/gemini-1.5-pro";
    const result = await ai.generate({
      model: selectedModel,
      prompt,
      output: { format: "json", schema },
      tools: [findEducationalLink],
    });
    const json = (result.output ?? {}) as StudyPlan;
    if (!json?.resource?.url) {
      const resource = await findEducationalLink({ topic: subject });
      json.resource = resource;
    }
    return json as StudyPlan;
  }
);



