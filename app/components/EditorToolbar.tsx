"use client";

import { VscPlay, VscDebugStop } from "react-icons/vsc";

interface EditorToolbarProps {
  running: boolean;
  stopping: boolean;
  deviceConnected: boolean;
  onRun: () => void;
  onStop: () => void;
}

function Spinner() {
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

export default function EditorToolbar({
  running,
  stopping,
  deviceConnected,
  onRun,
  onStop,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">main.py</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={running || stopping || !deviceConnected}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="実行"
        >
          <VscPlay className="text-sm" />
          実行
        </button>
        <button
          onClick={onStop}
          disabled={!running || stopping}
          className="flex items-center gap-1.5 rounded-md bg-zinc-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title={stopping ? "停止中..." : "停止"}
        >
          {stopping ? <Spinner /> : <VscDebugStop className="text-sm" />}
          停止
        </button>
      </div>
    </div>
  );
}
