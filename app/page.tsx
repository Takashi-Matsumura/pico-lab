"use client";

import { useState } from "react";

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
        <h1 className="text-lg font-semibold tracking-tight">PicoLab</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={running}
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
