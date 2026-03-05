# CLAUDE.md

## プロジェクト概要

PicoLab - AIと会話しながら Raspberry Pi Pico の電子回路を作る開発環境。

## 技術スタック

- Next.js 16 (App Router) / TypeScript / Tailwind CSS 4
- MicroPython + mpremote（Pico との通信）

## プロジェクト構成

- `app/` - Next.js App Router のページと API ルート
- `app/api/pico/` - Pico との通信 API（run, stop, device）
- `lib/pico.ts` - mpremote プロセス管理

## Pico との通信

- mpremote は PATH から解決（OS 非依存）
- デバイス検出: `mpremote devs` で VID:PID `2e8a:0005` を自動検出
- `mpremote run` で一時実行（RAM のみ、ファイルシステムに保存しない）
- 停止時はプロセス kill → soft-reset → LED 消灯の順序で処理
- macOS / Windows / Linux 対応

## コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - ビルド
- `npm run lint` - ESLint 実行
