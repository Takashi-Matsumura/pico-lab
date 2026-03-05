"use client";

import { useCallback, useEffect, useState } from "react";
import CodeEditor from "./components/CodeEditor";
import Chat from "./components/Chat";

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
  const [stopping, setStopping] = useState(false);
  const [device, setDevice] = useState<PicoDevice | null>(null);
  const [osLabel, setOsLabel] = useState<string | null>(null);

  const fetchDevice = useCallback(async () => {
    try {
      const res = await fetch("/api/pico/device");
      const data = await res.json();
      setDevice(data.device ?? null);
      // サーバーの実行状態と同期
      if (data.running !== undefined) {
        setRunning(data.running);
      }
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
    setStopping(true);
    const res = await fetch("/api/pico/stop", { method: "POST" });
    if (res.ok) {
      setRunning(false);
    }
    setStopping(false);
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
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
                {device.description}{" "}
                <span className="text-zinc-500">({device.port})</span>
              </span>
            ) : (
              <span className="text-zinc-500">未接続</span>
            )}
          </div>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 border-r border-zinc-800">
          <CodeEditor
            code={code}
            onChange={setCode}
            running={running}
            stopping={stopping}
            deviceConnected={!!device}
            onRun={handleRun}
            onStop={handleStop}
          />
        </div>
        <div className="flex w-1/2">
          <Chat code={code} onCodeUpdate={setCode} />
        </div>
      </main>
    </div>
  );
}
