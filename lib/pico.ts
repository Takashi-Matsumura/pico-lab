import { ChildProcess, spawn, execFileSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// mpremote は PATH から解決。Windows では "mpremote.exe" が使われる
const MPREMOTE = "mpremote";

// Pico の USB Vendor:Product ID
const PICO_VID_PID = "2e8a:0005";

export interface PicoDevice {
  port: string;
  serial: string;
  description: string;
}

export function detectDevice(): PicoDevice | null {
  try {
    const output = execFileSync(MPREMOTE, ["devs"], {
      timeout: 5000,
      encoding: "utf-8",
    });
    for (const line of output.split("\n")) {
      if (!line.includes(PICO_VID_PID)) continue;
      const parts = line.split(/\s+/);
      // macOS:   /dev/cu.usbmodem11301 e66368254f6c5333 2e8a:0005 MicroPython Board in FS mode
      // Windows: COM3                  e66368254f6c5333 2e8a:0005 MicroPython Board in FS mode
      const port = parts[0].replace("/dev/cu.", "/dev/tty.");
      const serial = parts[1];
      const description = parts.slice(3).join(" ");
      return { port, serial, description };
    }
  } catch {}
  return null;
}

let runningProcess: ChildProcess | null = null;

export function isRunning(): boolean {
  return runningProcess !== null;
}

export function runCode(code: string): { success: boolean; error?: string } {
  if (runningProcess) {
    return { success: false, error: "Already running" };
  }

  const device = detectDevice();
  if (!device) {
    return { success: false, error: "No Pico device found" };
  }

  const tmpFile = join(tmpdir(), "pico_run.py");
  writeFileSync(tmpFile, code);

  const proc = spawn(MPREMOTE, ["connect", device.port, "run", tmpFile], {
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

  const device = detectDevice();
  if (!device) {
    return { success: true };
  }

  return new Promise((resolve) => {
    const reset = spawn(MPREMOTE, ["connect", device.port, "soft-reset"], {
      stdio: "ignore",
    });
    reset.on("close", () => {
      const ledOff = spawn(MPREMOTE, [
        "connect", device.port,
        "exec", "from machine import Pin; Pin(25, Pin.OUT).value(0)",
      ], { stdio: "ignore" });
      ledOff.on("close", () => resolve({ success: true }));
      ledOff.on("error", () => resolve({ success: true }));
    });
    reset.on("error", () => resolve({ success: true }));
  });
}
