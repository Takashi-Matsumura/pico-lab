import { NextRequest, NextResponse } from "next/server";
import { runCode } from "@/lib/pico";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const result = runCode(code);
  return NextResponse.json(result, { status: result.success ? 200 : 409 });
}
