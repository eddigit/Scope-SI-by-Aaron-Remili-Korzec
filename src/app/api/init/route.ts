import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

// POST /api/init — Creates tables if they don't exist
// Call this once after setting up Vercel Postgres
export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ ok: true, message: "Database initialized" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
