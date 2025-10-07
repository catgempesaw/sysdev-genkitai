import "../../../../genkit.config";
import { NextResponse } from "next/server";
import { studyPlanGeneratorStructured, type StudyPlan } from "@/index";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const model = typeof body?.model === "string" ? body.model.trim() : undefined;
    if (!subject) {
      return NextResponse.json({ error: "Missing subject" }, { status: 400 });
    }

    const result = await studyPlanGeneratorStructured({ subject, model });
    return NextResponse.json({ data: result as StudyPlan }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


