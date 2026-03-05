# CLAUDE.md

## プロジェクト概要

PicoLab - AIと会話しながら Raspberry Pi Pico の電子回路を作る開発環境。

## 技術スタック

- Next.js 16 (App Router) / TypeScript / Tailwind CSS 4
- MicroPython + mpremote（Pico との通信）

## プロジェクト構成

- `app/` - Next.js App Router のページと API ルート
- `app/api/pico/` - Pico との通信 API（run, stop, device）
- `app/api/chat/` - AI チャット API（OpenAI）
- `app/api/system/` - システム情報 API（OS 判定）
- `app/components/` - UI コンポーネント（CodeEditor, Chat, ThemeToggle）
- `lib/pico.ts` - mpremote プロセス管理

## Pico との通信

- mpremote は PATH から解決（OS 非依存）
- デバイス検出: `mpremote devs` で VID:PID `2e8a:0005` を自動検出
- `mpremote run` で一時実行（RAM のみ、ファイルシステムに保存しない）
- 停止時は ps から mpremote プロセスを探して kill → 1.5秒待機 → soft-reset → LED 消灯
- macOS / Windows / Linux 対応

## AI ラボメン

- OpenAI API（gpt-4o）を使用。API キーは `.env.local` で管理
- 現在のエディタのコードをコンテキストとして送信
- AI がコードブロック（```python）を返すとエディタに自動反映
- ストリーミングレスポンス（SSE）

## テーマ

- ダーク/ライトモード対応（Tailwind `@variant dark` + `dark:` プレフィックス）
- `<html>` の `.dark` クラスで切り替え、localStorage に保存

## コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - ビルド
- `npm run lint` - ESLint 実行
