import { ChildProcess, spawn } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const MPREMOTE = "/Users/matsbaccano/.local/bin/mpremote";
const DEVICE = "/dev/tty.usbmodem11301";

let runningProcess: ChildProcess | null = null;

export function isRunning(): boolean {
  return runningProcess !== null;
}

export function runCode(code: string): { success: boolean; error?: string } {
  if (runningProcess) {
    return { success: false, error: "Already running" };
  }

  const tmpFile = join(tmpdir(), "pico_run.py");
  writeFileSync(tmpFile, code);

  const proc = spawn(MPREMOTE, ["connect", DEVICE, "run", tmpFile], {
    stdio: "ignore",
  });

  runningProcess = proc;

  proc.on("close", () => {
    runningProcess = null;
    try {
      unlinkSync(tmpFile);
    } catch {}
  });

  proc.on("error", () => {
    runningProcess = null;
    try {
      unlinkSync(tmpFile);
    } catch {}
  });

  return { success: true };
}

export async function stopCode(): Promise<{ success: boolean }> {
  if (runningProcess) {
    runningProcess.kill("SIGTERM");
    runningProcess = null;
  }

  // soft-reset and turn off LED
  return new Promise((resolve) => {
    const reset = spawn(MPREMOTE, ["connect", DEVICE, "soft-reset"], {
      stdio: "ignore",
    });
    reset.on("close", () => {
      const ledOff = spawn(MPREMOTE, [
        "connect", DEVICE,
        "exec", "from machine import Pin; Pin(25, Pin.OUT).value(0)",
      ], { stdio: "ignore" });
      ledOff.on("close", () => resolve({ success: true }));
      ledOff.on("error", () => resolve({ success: true }));
    });
    reset.on("error", () => resolve({ success: true }));
  });
}
