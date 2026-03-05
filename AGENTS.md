# AGENTS.md

## Cursor Cloud specific instructions

This repository (`tusky-io/docs`) is a [Mintlify](https://mintlify.com) documentation site for "Tusky — super simple decentralised storage." The config lives in `docs.json`.

- **Dev server**: `mintlify dev` (runs on port 3333 by default). Requires Node.js 20+.
- **No lint/test/build commands**: Mintlify is a hosted platform; there are no separate build, lint, or test scripts. Validate changes by running the dev server and checking pages return HTTP 200.
- **API reference pages** use Mintlify's API page format with `api:` frontmatter for the built-in playground. Components like `<ParamField>`, `<ResponseField>`, `<Expandable>`, `<CodeGroup>`, `<Note>`, and `<Warning>` are Mintlify built-ins.
- **Navigation** is defined in `docs.json` under the `navigation` object (Mintlify v4+ format: `{ groups: [...], tabs: [...] }`). The legacy array format from `mint.json` will cause a startup error. Any new page must be added there.
- `colors.anchors` is **not a valid key** in the current Mintlify schema — use only `primary`, `light`, `dark`.
- The `favicon.svg` and logo files referenced in `docs.json` are not yet present; the dev server logs a non-blocking error for missing favicons.
