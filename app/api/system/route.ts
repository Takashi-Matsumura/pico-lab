import { NextResponse } from "next/server";
import { platform } from "os";

export async function GET() {
  const os = platform();
  const label =
    os === "darwin" ? "macOS" :
    os === "win32" ? "Windows" :
    os === "linux" ? "Linux" :
    os;
  return NextResponse.json({ os, label });
}
