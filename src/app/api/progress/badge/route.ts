import { NextRequest, NextResponse } from "next/server";
import { addBadgeDB } from "@/lib/db";

// POST /api/progress/badge — Add a badge
export async function POST(request: NextRequest) {
  try {
    const studentId = request.cookies.get("infoscope_sid")?.value;
    if (!studentId) {
      return NextResponse.json({ ok: false, error: "Non connecté" }, { status: 401 });
    }

    const { badgeId } = await request.json();
    if (!badgeId) {
      return NextResponse.json({ ok: false, error: "Badge ID manquant" }, { status: 400 });
    }

    await addBadgeDB(studentId, badgeId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
