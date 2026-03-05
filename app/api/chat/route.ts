import { NextRequest } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `あなたは PicoLab のAIラボメンです。
Raspberry Pi Pico の MicroPython 開発をサポートします。

役割:
- ユーザーのコードを解説する
- ユーザーの開発要望に応じてコードを修正・生成する
- 電子回路やセンサーの使い方を説明する

ルール:
- コードを提案・修正する場合は、必ず完全なコードを \`\`\`python のコードブロックで返してください
- コードブロックは1つだけにしてください（ユーザーのエディタに直接反映されます）
- MicroPython で動作するコードを書いてください（CPython との違いに注意）
- 回答は簡潔に、日本語で返してください`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY が設定されていません。.env.local を確認してください。" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, code } = await req.json();

  const openai = new OpenAI({ apiKey });

  const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `現在のエディタのコード:\n\`\`\`python\n${code}\n\`\`\`` },
    ...messages,
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: chatMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
