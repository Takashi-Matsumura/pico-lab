import { ChildProcess, spawn, execFileSync, execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join, basename } from "path";
import { platform } from "os";

// mpremote は PATH から解決。Windows では "mpremote.exe" が使われる
const MPREMOTE = "mpremote";

// Pico の USB Vendor:Product ID
const PICO_VID_PID = "2e8a:0005";

export interface PicoDevice {
  port: string;
  serial: string;
  description: string;
}

/**
 * 実行中の mpremote プロセスのコマンドラインからデバイス情報を復元する。
 * モジュール再読み込み後でもプロセス一覧から取得できる。
 */
export function getRunningDevice(): PicoDevice | null {
  try {
    if (platform() === "win32") {
      // TODO: Windows 対応
      return null;
    }
    const list = execSync("ps aux", { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    for (const line of list.split("\n")) {
      if (line.includes("mpremote") && line.includes("connect") && line.includes("run") && !line.includes("grep")) {
        // ... mpremote connect /dev/tty.usbmodem11301 run ...
        const match = line.match(/connect\s+(\S+)\s+run/);
        if (match) {
          return { port: match[1], serial: "", description: "MicroPython Board in FS mode" };
        }
      }
    }
  } catch {}
  return null;
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

/**
 * 実行中の mpremote run プロセスをプロセス一覧から探して kill する。
 * Next.js がモジュールを再読み込みしても確実に動作する。
 */
function killMpremoteRunProcesses(): boolean {
  try {
    if (platform() === "win32") {
      const list = execSync('wmic process where "commandline like \'%mpremote%run%\'" get processid /format:list', {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const pids = list.match(/ProcessId=(\d+)/g);
      if (pids) {
        for (const match of pids) {
          const pid = match.split("=")[1];
          try { execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" }); } catch {}
        }
        return true;
      }
    } else {
      const list = execSync("ps aux", { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
      for (const line of list.split("\n")) {
        if (line.includes("mpremote") && line.includes("run") && !line.includes("grep")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[1];
          try { execSync(`kill -9 ${pid}`, { stdio: "ignore" }); } catch {}
        }
      }
      return true;
    }
  } catch {}
  return false;
}

export function isRunning(): boolean {
  // プロセス一覧から mpremote run が動いているか確認
  try {
    if (platform() === "win32") {
      const list = execSync('wmic process where "commandline like \'%mpremote%run%\'" get processid /format:list', {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      return /ProcessId=\d+/.test(list);
    } else {
      const list = execSync("ps aux | grep 'mpremote.*run' | grep -v grep", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      return list.trim().length > 0;
    }
  } catch {}
  return false;
}

export function runCode(code: string): { success: boolean; error?: string } {
  if (isRunning()) {
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
    detached: true,
  });

  // 親プロセスが終了しても子プロセスを巻き込まない
  proc.unref();

  return { success: true };
}

export async function stopCode(): Promise<{ success: boolean }> {
  // プロセス一覧から mpremote run を探して kill
  killMpremoteRunProcesses();

  // ポートが解放されるのを待つ
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // soft-reset + LED消灯
  const device = detectDevice();
  if (device) {
    try {
      execFileSync(MPREMOTE, ["connect", device.port, "soft-reset"], {
        timeout: 5000,
        stdio: "ignore",
      });
    } catch {}
    try {
      execFileSync(MPREMOTE, [
        "connect", device.port,
        "exec", "from machine import Pin; Pin(25, Pin.OUT).value(0)",
      ], {
        timeout: 5000,
        stdio: "ignore",
      });
    } catch {}
  }

  return { success: true };
}
