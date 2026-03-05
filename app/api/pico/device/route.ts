import { NextResponse } from "next/server";
import { detectDevice, isRunning, getRunningDevice } from "@/lib/pico";

export async function GET() {
  const running = isRunning();
  if (running) {
    // 実行中は mpremote devs がポートと競合するので、プロセス情報からデバイスを復元
    const device = getRunningDevice();
    return NextResponse.json({ device, running: true });
  }
  const device = detectDevice();
  return NextResponse.json({ device, running: false });
}
