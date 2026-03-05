import { NextResponse } from "next/server";
import { stopCode } from "@/lib/pico";

export async function POST() {
  const result = await stopCode();
  return NextResponse.json(result);
}
