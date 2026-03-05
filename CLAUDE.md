# CLAUDE.md

## プロジェクト概要

PicoLab - AIと会話しながら Raspberry Pi Pico の電子回路を作る開発環境。

## 技術スタック

- Next.js 16 (App Router) / TypeScript / Tailwind CSS 4
- MicroPython + mpremote（Pico との通信）

## プロジェクト構成

- `app/` - Next.js App Router のページと API ルート
- `app/api/pico/` - Pico との通信 API（run, stop）
- `lib/pico.ts` - mpremote プロセス管理

## Pico との通信

- mpremote パス: `/Users/matsbaccano/.local/bin/mpremote`
- デバイス: `/dev/tty.usbmodem11301`（接続時）
- `mpremote run` で一時実行（RAM のみ、ファイルシステムに保存しない）
- 停止時はプロセス kill → soft-reset → LED 消灯の順序で処理

## コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - ビルド
- `npm run lint` - ESLint 実行
