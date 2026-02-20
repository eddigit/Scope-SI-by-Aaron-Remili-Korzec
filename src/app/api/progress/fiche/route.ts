import { NextRequest, NextResponse } from "next/server";
import { markFicheReadDB } from "@/lib/db";

// POST /api/progress/fiche — Mark a fiche as read
export async function POST(request: NextRequest) {
  try {
    const studentId = request.cookies.get("infoscope_sid")?.value;
    if (!studentId) {
      return NextResponse.json({ ok: false, error: "Non connecté" }, { status: 401 });
    }

    const { moduleId, ficheId } = await request.json();
    if (!moduleId || !ficheId) {
      return NextResponse.json({ ok: false, error: "Paramètres manquants" }, { status: 400 });
    }

    await markFicheReadDB(studentId, moduleId, ficheId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
