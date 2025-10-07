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
- `src/index.ts` defines two Genkit flows:
  - `studyPlanGenerator`: simple string in/out flow returning bullet suggestions
  - `studyPlanGeneratorStructured`: structured JSON output with topics and a resource, may call the `findEducationalLink` tool
- `src/app/api/generate/route.ts` exposes a POST endpoint that validates input and invokes `studyPlanGeneratorStructured`.
- `src/app/page.tsx` provides a small client UI to submit a subject and render results.

## API
### POST /api/generate
- Request body:
```json
{ "subject": "World History" }
```
- Success response `200`:
```json
{
  "data": {
    "subject": "World History",
    "topics": ["..."],
    "resource": { "title": "...", "url": "https://..." }
  }
}
```
- Error responses:
```json
{ "error": "Missing subject" }     // 400
{ "error": "Internal Server Error" } // 500
```

## Flows and Tools
- Flow: `studyPlanGenerator(subject: string) → { text: string }`
- Tool: `findEducationalLink(topic: string) → { title: string, url: string }`
- Flow: `studyPlanGeneratorStructured(subject: string) → { subject, topics[], resource }`
  - Uses model `googleai/gemini-1.5-pro` and can invoke `findEducationalLink`.

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

## License
MIT (or project default). Update if different.
