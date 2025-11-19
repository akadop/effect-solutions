# Effect Solutions

Monorepo for the Effect Solutions reference site (Next.js 16) and the
`effect-solutions` CLI/Claude skill installer.

## Requirements

- [Bun](https://bun.sh) 1.1+
- Node 18+ (for the Next.js dev server)

## Workspace Layout

| Path | Description |
| --- | --- |
| `packages/website` | Next.js site that renders the Effect Solutions docs |
| `packages/cli` | Bun-based `effect-solutions` installer/skill exporter |
| `.github/workflows/` | Automation (Validate Documentation, Claude responders) |

The root `bun.lock` tracks dependencies for all workspaces.

## Installation

```bash
bun install
```

## Development

- **Website:** `bun run dev` proxies to `packages/website`, then visit `http://localhost:3000`.
- **CLI:** `bun --cwd packages/cli run dev` executes the `effect-solutions` installer locally.

### Root scripts

```bash
bun run build      # builds every workspace via Bun filters
bun run check      # biome check + TypeScript project references
bun run typecheck  # standalone tsc --build --force
bun run format     # biome format --write
```

## Automation

The `Validate Documentation` GitHub Action (`.github/workflows/validate-docs.yml`) uses Claude Code to compare local references against their upstream sources each night. Keep local docs accurate so the workflow stays green.

## Updating references

Add new docs under `packages/website/references/`. The `effect-solutions` CLI packages any `*.md`/`*.mdx` file automatically during its build, so no manual manifests are necessary.
