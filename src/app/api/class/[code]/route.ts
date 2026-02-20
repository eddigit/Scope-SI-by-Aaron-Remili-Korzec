import { NextRequest, NextResponse } from "next/server";
import { getClassStudents } from "@/lib/db";
import { TEACHER_CODES } from "@/data/modules";

// GET /api/class/[code]?teacher=PROF-XXX — Teacher view: get class data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const teacherCode = request.nextUrl.searchParams.get("teacher");

    // Verify teacher authorization
    if (!teacherCode || TEACHER_CODES[teacherCode] !== code) {
      return NextResponse.json(
        { ok: false, error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const students = await getClassStudents(code);

    return NextResponse.json({ ok: true, students });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
