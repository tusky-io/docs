# AGENTS.md

## Cursor Cloud specific instructions

This repository (`tusky-io/docs`) is a Mintlify documentation site for "Tusky — super simple decentralised storage."

- **Framework**: Mintlify (MDX-based). Config lives in `docs.json` (new format, not the legacy `mint.json`).
- **Node version**: Use Node 20 (`nvm use 20`). The Mintlify CLI has compatibility issues with Node 22+.
- **Dev server**: `mintlify dev` (runs on port 3000 by default; use `--port <n>` for a custom port).
- **Validation**: `mintlify validate` — strict mode, exits on warnings or errors. Run this before committing.
- **No automated tests** — this is a docs-only repo. Validation (`mintlify validate`) is the primary check.
- **Navigation schema**: `docs.json` uses the v2 navigation format (object with `groups` / `tabs` at the top level). See [Mintlify docs](https://mintlify.com/docs/navigation) for reference. Do not use the legacy array-based `navigation` format.
