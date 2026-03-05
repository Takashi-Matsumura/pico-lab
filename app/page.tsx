"use client";

import { useCallback, useEffect, useState } from "react";

interface PicoDevice {
  port: string;
  serial: string;
  description: string;
}

const DEFAULT_CODE = `from machine import Pin
import time

led = Pin(25, Pin.OUT)

while True:
    led.value(1)
    time.sleep(0.5)
    led.value(0)
    time.sleep(0.5)`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [device, setDevice] = useState<PicoDevice | null>(null);
  const [osLabel, setOsLabel] = useState<string | null>(null);

  const fetchDevice = useCallback(async () => {
    try {
      const res = await fetch("/api/pico/device");
      const data = await res.json();
      setDevice(data.device ?? null);
    } catch {
      setDevice(null);
    }
  }, []);

  useEffect(() => {
    fetchDevice();
    const id = setInterval(fetchDevice, 3000);
    return () => clearInterval(id);
  }, [fetchDevice]);

  useEffect(() => {
    fetch("/api/system")
      .then((res) => res.json())
      .then((data) => setOsLabel(data.label))
      .catch(() => {});
  }, []);

  const handleRun = async () => {
    const res = await fetch("/api/pico/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      setRunning(true);
    }
  };

  const handleStop = async () => {
    const res = await fetch("/api/pico/stop", { method: "POST" });
    if (res.ok) {
      setRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold tracking-tight">PicoLab</h1>
          {osLabel && (
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {osLabel}
            </span>
          )}
          <div
            title={
              device
                ? "Pico はシリアルデバイスとして接続されています。USBケーブルはそのまま抜き差しできます（OS の取り出し操作は不要です）。"
                : "Pico が検出されません。USBケーブルで接続してください。MicroPython ファームウェアが必要です。"
            }
            className="flex cursor-help items-center gap-2 rounded-md border border-zinc-800 px-3 py-1 text-xs"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                device ? "bg-emerald-400" : "bg-zinc-600"
              }`}
            />
            {device ? (
              <span className="text-zinc-300">
                {device.description} <span className="text-zinc-500">({device.port})</span>
              </span>
            ) : (
              <span className="text-zinc-500">未接続</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={running || !device}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>▶</span> 再生
          </button>
          <button
            onClick={handleStop}
            disabled={!running}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>■</span> 停止
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-100 outline-none focus:border-zinc-600"
        />
      </main>
    </div>
  );
}
