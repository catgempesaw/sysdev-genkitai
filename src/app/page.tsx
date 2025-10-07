"use client";
import { useState } from "react";

type StudyPlan = {
  subject: string;
  topics: string[];
  resource: { title: string; url: string };
};

export default function Home() {
  const [subject, setSubject] = useState<string>("");
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [model, setModel] = useState<string>("googleai/gemini-1.5-pro");

  const handleGenerate = async () => {
    const s = subject.trim();
    if (!s) {
      setError("Please enter a subject");
      return;
    }
    setError("");
    setIsLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: s, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate");
      setPlan(data.data as StudyPlan);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <div className="font-sans text-foreground">
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-brand-700 dark:text-brand-300">
            Francis the StudyMate
          </h1>
          <p className="text-sm text-brand-800/80 dark:text-brand-100/80 max-w-prose">
            Your friendly study plan generator. Enter a subject, hit Generate, and get a
            clear set of topics plus one helpful resource.
          </p>
        </header>

        <section className="flex flex-col gap-3" aria-label="Study plan generator">
          <label htmlFor="subject" className="text-sm opacity-80">
            Enter a subject
          </label>
          <div className="flex gap-2">
            <input
              id="subject"
              aria-label="Subject"
              tabIndex={0}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., World History"
              className="flex-1 rounded-md border border-brand-600/30 bg-white/80 dark:bg-brand-900/20 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-500 placeholder:opacity-60"
            />
            <label htmlFor="model" className="sr-only">Model</label>
            <select
              id="model"
              aria-label="Model"
              tabIndex={0}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-md border border-brand-600/30 bg-white/80 dark:bg-brand-900/20 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-500"
            >
              <option value="googleai/gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="openai/gpt-4o-mini">OpenAI GPT-4o mini</option>
              <option value="openai/gpt-4o">OpenAI GPT-4o</option>
            </select>
            <button
              onClick={handleGenerate}
              aria-label="Generate study plan"
              className="rounded-md bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-brand-foreground px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Generating…" : "Generate"}
            </button>
          </div>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        </section>

        <section aria-live="polite" className="space-y-4">
          {isLoading && (
            <div className="rounded-lg border border-brand-600/20 bg-brand-50/40 dark:bg-brand-900/20 p-4 animate-pulse">
              <div className="h-4 w-40 bg-brand-600/30 rounded mb-2" />
              <div className="space-y-1">
                <div className="h-3 w-2/3 bg-brand-600/20 rounded" />
                <div className="h-3 w-1/2 bg-brand-600/20 rounded" />
                <div className="h-3 w-3/4 bg-brand-600/20 rounded" />
              </div>
            </div>
          )}

          {plan && !isLoading && (
            <div className="rounded-lg border border-brand-600/20 bg-white/70 dark:bg-brand-900/20 backdrop-blur p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-700 dark:text-brand-200">{plan.subject}</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {plan.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              {plan.resource?.url && (
                <a
                  href={plan.resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-brand-700 dark:text-brand-300 underline hover:text-brand-800"
                >
                  {plan.resource.title || "View resource"}
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
