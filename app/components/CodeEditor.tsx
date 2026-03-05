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
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">main.py</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onRun}
            disabled={running || stopping || !deviceConnected}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="実行"
          >
            <VscPlay className="text-base" />
          </button>
          <button
            onClick={onStop}
            disabled={!running || stopping}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title={stopping ? "停止中..." : "停止"}
          >
            {stopping ? <Spinner /> : <VscDebugStop className="text-base" />}
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 resize-none bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-900 outline-none dark:bg-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}
