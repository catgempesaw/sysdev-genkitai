# SysDev Genkit Workshop

A minimal Next.js (App Router) app demonstrating Google Genkit flows and tools to generate a concise study plan via an API route, with a small client UI.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 (via @tailwindcss/postcss)
- Genkit ^1.21 with `@genkit-ai/google-genai`
- Biome for linting/formatting

## Project Structure
```
src/
  app/
    api/
      generate/
        route.ts       # POST /api/generate → calls Genkit flow
    globals.css         # Tailwind base
    layout.tsx
    page.tsx            # Simple UI to call the API
  index.ts              # Genkit flows/tools exported for server usage

genkit.config.ts        # Genkit plugin configuration (googleAI)
next.config.ts
postcss.config.mjs
package.json
```

## Getting Started
1) Install dependencies
```bash
bun install
# or
npm install
# or
yarn
# or
pnpm i
```

2) Configure environment
- Set Google GenAI credentials for Genkit. Common setups include:
  - `GOOGLE_GENAI_API_KEY` (if using Google AI Studio key)
  - Or authenticate with Google Cloud if using Vertex AI models.

Ensure your environment provides access to the model `googleai/gemini-1.5-pro` used in flows. For local development, placing `GOOGLE_GENAI_API_KEY` in `.env.local` is typical:
```bash
# .env.local
GOOGLE_GENAI_API_KEY=your_api_key_here
```

3) Run the development server
```bash
bun dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open `http://localhost:3000` to view the UI.

## Available Scripts
```bash
bun dev            # next dev --turbopack
bun run build      # next build --turbopack
bun start          # next start
bun run genkit     # genkit start (local Genkit tools console)
bun run lint       # biome check
bun run format     # biome format --write
```
(Use your chosen package manager equivalents.)

## Core Concepts
This project demonstrates comprehensive usage of Genkit's core features:

### Prompts
Reusable prompt templates defined with `ai.definePrompt()`:
- `studyTopicsPrompt`: Generates study topics with customizable parameters
- `structuredStudyPlanPrompt`: Creates detailed study plans with difficulty-based guidance

### Tools
Modular tool definitions using `ai.defineTool()`:
- `findEducationalLink`: Finds educational resources across platforms (YouTube, Khan Academy, Coursera)
- `estimateStudyTime`: Calculates study time estimates based on difficulty level
- `generateQuizQuestions`: Creates assessment questions for topics

### Flows
Three production-ready flows demonstrating progressive complexity:
- `studyPlanGenerator`: Simple text generation using defined prompts
- `studyPlanGeneratorStructured`: Structured JSON output with tool integration
- `enhancedStudyPlanGenerator`: Advanced flow combining multiple tools with conditional logic

### API & UI
- `src/app/api/generate/route.ts`: REST endpoint supporting multiple flow modes
- `src/app/page.tsx`: Interactive UI with difficulty selection, model choice, and enhanced features

## API
### POST /api/generate
- Request body:
```json
{
  "subject": "World History",
  "difficulty": "beginner",
  "model": "googleai/gemini-2.0-flash-exp",
  "flowMode": "structured",
  "enhanced": false,
  "includeTimeEstimates": false,
  "includeQuiz": false,
  "topicCount": 5
}
```
- Success response `200` (simple mode):
```json
{
  "data": {
    "text": "• Ancient Civilizations\n• Medieval Europe\n• Renaissance\n..."
  },
  "quiz": null,
  "meta": {
    "flowMode": "simple",
    "toolsUsed": ["studyTopicsPrompt"]
  }
}
```
- Success response `200` (structured mode):
```json
{
  "data": {
    "subject": "World History",
    "difficulty": "beginner",
    "topics": ["Ancient Civilizations", "Medieval Europe", "..."],
    "resource": {
      "title": "Introduction to World History",
      "url": "https://...",
      "platform": "YouTube"
    }
  },
  "quiz": null,
  "meta": {
    "flowMode": "structured",
    "toolsUsed": ["structuredStudyPlanPrompt", "findEducationalLink"]
  }
}
```
- Success response `200` (enhanced mode with time estimates and quiz):
```json
{
  "data": {
    "subject": "World History",
    "difficulty": "beginner",
    "topics": [
      {
        "name": "Ancient Civilizations",
        "estimatedTime": { "hoursPerWeek": 5, "totalWeeks": 4 }
      }
    ],
    "resource": { "title": "...", "url": "https://...", "platform": "YouTube" },
    "totalEstimatedHours": 20
  },
  "quiz": [
    {
      "topic": "Ancient Civilizations",
      "questions": [
        {
          "question": "What were the main characteristics of Mesopotamian civilization?",
          "type": "short-answer"
        }
      ]
    }
  ],
  "meta": {
    "flowMode": "enhanced",
    "toolsUsed": ["structuredStudyPlanPrompt", "findEducationalLink", "estimateStudyTime", "generateQuizQuestions"]
  }
}
```
- Error responses:
```json
{ "error": "Missing subject" }     // 400
{ "error": "Internal Server Error" } // 500
```

## Genkit Features Demonstrated

### All 3 Flows Now Exposed in UI
You can now select between different flow modes in the UI:

1. **Simple Flow** (`studyPlanGenerator`)
   - Uses: `studyTopicsPrompt`
   - Returns plain text bullet list of topics
   - Configurable topic count (3-10)
   - Best for quick topic brainstorming

2. **Structured Flow** (`studyPlanGeneratorStructured`)
   - Uses: `structuredStudyPlanPrompt`, `findEducationalLink`
   - Returns JSON with structured data
   - Includes educational resources
   - Best for organized study plans

3. **Enhanced Flow** (`enhancedStudyPlanGenerator`)
   - Uses: All above + `estimateStudyTime`, `generateQuizQuestions` (optional)
   - Returns enhanced JSON with time estimates
   - Optional quiz generation for each topic
   - Best for comprehensive learning plans

### Prompts (ai.definePrompt)
✅ **All prompts now used:**
- `studyTopicsPrompt`: Simple topic generation (used in simple flow)
- `structuredStudyPlanPrompt`: Detailed study plan creation (used in structured/enhanced flows)
- Reusable templates with typed inputs
- Variable interpolation with `{{variable}}` syntax

### Tools (ai.defineTool)
✅ **All tools now used:**
- `findEducationalLink`: Platform-specific resource discovery (YouTube, Khan Academy, Coursera)
- `estimateStudyTime`: Difficulty-based time calculations (beginner/intermediate/advanced)
- `generateQuizQuestions`: Assessment question generation (multiple-choice, true-false, short-answer)
- Typed input/output schemas with Zod validation
- Tool composition in generate calls

### Visual Indicators
The UI now shows:
- **Active Tools Badge**: Displays which Genkit tools/prompts are being used for each request
- **Quiz Section**: Beautiful purple-themed quiz display when enabled
- **Flow Selection**: Dropdown to choose between simple/structured/enhanced modes
- **Advanced Options**: Contextual options based on selected flow

## Development Notes
- The API route imports `genkit.config.ts` to register the `googleAI` plugin before calling flows.
- Tailwind is configured via v4 preset in `postcss.config.mjs` and classes in `globals.css`.
- Biome is used for lint/format; adjust rules in `biome.json`.

## Troubleshooting
- 401/permission errors from generation:
  - Verify `GOOGLE_GENAI_API_KEY` or cloud auth is correctly configured.
  - Ensure the selected model is accessible to your key/account.
- `fetch /api/generate` fails:
  - Check server logs in the terminal running `dev`.
  - Confirm request JSON includes a non-empty `subject`.
- Type errors after dependency upgrades:
  - Reinstall deps, then run `bun run lint` and `bun run format`.