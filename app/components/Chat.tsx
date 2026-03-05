"use client";

import { useRef, useEffect, useState } from "react";
import { VscSend } from "react-icons/vsc";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  code: string;
  onCodeUpdate: (code: string) => void;
}

function extractCodeBlock(text: string): string | null {
  const match = text.match(/```python\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

export default function Chat({ code, onCodeUpdate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "PicoLab のラボメンです。コードの解説や、開発の要望をお聞かせください。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m !== messages[0])
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "エラーが発生しました。" },
        ]);
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          const data = JSON.parse(line.slice(6));
          assistantContent += data.content;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantContent,
            };
            return updated;
          });
        }
      }

      const codeBlock = extractCodeBlock(assistantContent);
      if (codeBlock) {
        onCodeUpdate(codeBlock);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "通信エラーが発生しました。" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">AI ラボメン</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed ${
              msg.role === "user"
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <span
              className={`mr-2 text-xs font-medium ${
                msg.role === "user" ? "text-blue-500 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {msg.role === "user" ? "You" : "AI"}
            </span>
            <span className="whitespace-pre-wrap">{msg.content}</span>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="text-sm text-zinc-400 dark:text-zinc-500">
            <span className="mr-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">AI</span>
            考え中...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="コードの解説や修正を依頼..."
            disabled={loading}
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-blue-600 p-2 text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="送信"
          >
            <VscSend className="text-base" />
          </button>
        </div>
      </form>
    </div>
  );
}
