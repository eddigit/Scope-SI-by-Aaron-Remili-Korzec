import { NextResponse } from "next/server";

// POST /api/auth/logout — Clear session
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("infoscope_sid");
  return response;
}
