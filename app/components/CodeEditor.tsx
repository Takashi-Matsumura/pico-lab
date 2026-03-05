"use client";

import { VscPlay, VscDebugStop } from "react-icons/vsc";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
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

export default function CodeEditor({
  code,
  onChange,
  running,
  stopping,
  deviceConnected,
  onRun,
  onStop,
}: CodeEditorProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium text-zinc-400">main.py</span>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={running || stopping || !deviceConnected}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <VscPlay className="text-sm" /> 実行
          </button>
          <button
            onClick={onStop}
            disabled={!running || stopping}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stopping ? <Spinner /> : <VscDebugStop className="text-sm" />}
            {stopping ? "停止中..." : "停止"}
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 resize-none bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-100 outline-none"
      />
    </div>
  );
}
