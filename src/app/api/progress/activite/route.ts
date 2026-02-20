import { NextRequest, NextResponse } from "next/server";
import { markActiviteCompletedDB } from "@/lib/db";

// POST /api/progress/activite — Mark an activity as completed
export async function POST(request: NextRequest) {
  try {
    const studentId = request.cookies.get("infoscope_sid")?.value;
    if (!studentId) {
      return NextResponse.json({ ok: false, error: "Non connecté" }, { status: 401 });
    }

    const { moduleId, activiteId, score } = await request.json();
    if (!moduleId || !activiteId || score === undefined) {
      return NextResponse.json({ ok: false, error: "Paramètres manquants" }, { status: 400 });
    }

    await markActiviteCompletedDB(studentId, moduleId, activiteId, score);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
