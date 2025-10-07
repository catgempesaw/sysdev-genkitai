import { googleAI } from "@genkit-ai/google-genai";
import { openAI } from "@genkit-ai/openai";

export default {
  plugins: [googleAI(), openAI()],
};


