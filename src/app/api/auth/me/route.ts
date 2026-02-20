import { NextRequest, NextResponse } from "next/server";
import { getStudent, getStudentProgress } from "@/lib/db";

// GET /api/auth/me — Get current student info + progress
export async function GET(request: NextRequest) {
  try {
    const studentId = request.cookies.get("infoscope_sid")?.value;

    if (!studentId) {
      return NextResponse.json({ ok: false, error: "Non connecté" }, { status: 401 });
    }

    const student = await getStudent(studentId);
    if (!student) {
      // Cookie exists but student not found — clear cookie
      const response = NextResponse.json(
        { ok: false, error: "Étudiant introuvable" },
        { status: 401 }
      );
      response.cookies.delete("infoscope_sid");
      return response;
    }

    const progress = await getStudentProgress(studentId);

    return NextResponse.json({
      ok: true,
      student: {
        id: student.id,
        pseudo: student.pseudo,
        classCode: student.class_code,
      },
      progress,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
