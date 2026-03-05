import { NextResponse } from "next/server";
import { detectDevice } from "@/lib/pico";

export async function GET() {
  const device = detectDevice();
  return NextResponse.json({ device });
}
