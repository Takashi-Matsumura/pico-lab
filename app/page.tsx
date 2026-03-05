"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PicoDevice } from "@/lib/pico";
import Header from "./components/Header";
import EditorToolbar from "./components/EditorToolbar";
import CodeEditor from "./components/CodeEditor";
import Chat from "./components/Chat";
import Webcam, { type WebcamHandle } from "./components/Webcam";

const DEFAULT_CODE = `from machine import Pin
import time

led = Pin(25, Pin.OUT)

while True:
    led.value(1)
    time.sleep(0.5)
    led.value(0)
    time.sleep(0.5)`;

export default function Home() {
  const webcamRef = useRef<WebcamHandle>(null);
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
    <div className="flex h-screen flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header osLabel={osLabel} device={device} />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 flex-col border-r border-zinc-200 dark:border-zinc-800">
          <EditorToolbar
            running={running}
            stopping={stopping}
            deviceConnected={!!device}
            onRun={handleRun}
            onStop={handleStop}
          />
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={setCode} running={running} />
          </div>
        </div>
        <div className="flex w-1/2 flex-col">
          <div className="h-1/2 border-b border-zinc-200 dark:border-zinc-800">
            <Webcam ref={webcamRef} />
          </div>
          <div className="flex h-1/2">
            <Chat
              code={code}
              onCodeUpdate={setCode}
              onCaptureImage={() => webcamRef.current?.capture() ?? null}
            />
          </div>
        </div>
      </main>
      <footer className="flex items-center justify-center border-t border-zinc-200 px-6 py-2 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; MatsBACCANO
        </p>
      </footer>
    </div>
  );
}
