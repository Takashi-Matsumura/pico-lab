"use client";

import type { PicoDevice } from "@/lib/pico";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  osLabel: string | null;
  device: PicoDevice | null;
}

export default function Header({ osLabel, device }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">PicoLab</h1>
        {osLabel && (
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {osLabel}
          </span>
        )}
        <div
          title={
            device
              ? "Pico はシリアルデバイスとして接続されています。USBケーブルはそのまま抜き差しできます（OS の取り出し操作は不要です）。"
              : "Pico が検出されません。USBケーブルで接続してください。MicroPython ファームウェアが必要です。"
          }
          className="flex cursor-help items-center gap-2 rounded-md border border-zinc-200 px-3 py-1 text-xs dark:border-zinc-800"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              device ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          />
          {device ? (
            <span className="text-zinc-600 dark:text-zinc-300">
              {device.description}{" "}
              <span className="text-zinc-400 dark:text-zinc-500">({device.port})</span>
            </span>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500">未接続</span>
          )}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
