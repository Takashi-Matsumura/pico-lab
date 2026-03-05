"use client";

import { useRef, useEffect, useCallback } from "react";
import { VscPlay, VscDebugStop } from "react-icons/vsc";
import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

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

const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#fafafa",
    color: "#18181b",
  },
  ".cm-gutters": {
    backgroundColor: "#fafafa",
    borderRight: "1px solid #e4e4e7",
    color: "#a1a1aa",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f4f4f5",
  },
  ".cm-activeLine": {
    backgroundColor: "#f4f4f515",
  },
});

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    lineHeight: "1.625",
  },
});

function isDarkMode() {
  return document.documentElement.classList.contains("dark");
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
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeComp = useRef(new Compartment());
  const readonlyComp = useRef(new Compartment());
  const isExternalUpdate = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const getThemeExtension = useCallback(() => {
    return isDarkMode() ? oneDark : lightTheme;
  }, []);

  // Mount editor
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        python(),
        baseTheme,
        themeComp.current.of(getThemeExtension()),
        readonlyComp.current.of(EditorState.readOnly.of(running)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdate.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    // Watch for dark/light class changes on <html>
    const observer = new MutationObserver(() => {
      view.dispatch({
        effects: themeComp.current.reconfigure(getThemeExtension()),
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external code changes (e.g. AI updates)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== code) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
      isExternalUpdate.current = false;
    }
  }, [code]);

  // Sync readonly state
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readonlyComp.current.reconfigure(
        EditorState.readOnly.of(running)
      ),
    });
  }, [running]);

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
      <div ref={containerRef} className="flex-1 overflow-auto" />
    </div>
  );
}
