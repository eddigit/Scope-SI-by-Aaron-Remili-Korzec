import { NextRequest, NextResponse } from "next/server";
import { createStudent } from "@/lib/db";
import { VALID_CLASS_CODES } from "@/data/modules";

// POST /api/auth/join — Register a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pseudo, classCode } = body;

    if (!classCode || !VALID_CLASS_CODES.includes(classCode)) {
      return NextResponse.json(
        { ok: false, error: "Code classe invalide" },
        { status: 400 }
      );
    }

    const studentName = (pseudo || "Explorateur").slice(0, 50);
    const studentId = await createStudent(studentName, classCode);

    const response = NextResponse.json({
      ok: true,
      studentId,
      pseudo: studentName,
      classCode,
    });

    // Set a cookie so the student is recognized on subsequent visits
    response.cookies.set("infoscope_sid", studentId, {
      httpOnly: false, // Client needs to read it for routing
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
