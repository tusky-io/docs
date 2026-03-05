# AGENTS.md

## Cursor Cloud specific instructions

This repository (`tusky-io/docs`) is a Mintlify documentation site for "Tusky — super simple decentralised storage on Walrus."

- **Framework**: Mintlify (MDX-based). Config lives in `docs.json` (v2 navigation format with `groups` / `tabs`).
- **Dev server**: `mintlify dev` (port 3000 by default; `--port <n>` for custom). Mintlify CLI is installed globally via `npm i -g mintlify`.
- **Validation**: `mintlify validate` — run before committing to catch broken navigation or invalid MDX.
- **No automated tests** — this is a docs-only repo. Validation is the primary check.
- **Sections**: Main docs (introduction, quickstart, getting-started, core-concepts, aggregators, billing, tools, architecture), API Reference tab (REST endpoints), SDK tab (TypeScript SDK reference).
- **Public test URL**: Can be created ad-hoc with `cloudflared tunnel --url http://localhost:3000` (gives a `*.trycloudflare.com` URL).
