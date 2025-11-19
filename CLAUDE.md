# Effect Solutions Repository

This Bun workspace powers the Effect Solutions documentation site and installer.

## Project Structure

- `packages/website/` - Next.js 16 documentation site
- `packages/cli/` - `effect-solutions` CLI/Claude skill installer
- `.github/workflows/` - Validate Documentation & Claude automation

## Living Documentation

This repository uses GitHub Actions to maintain documentation accuracy:
- **validate-docs.yml** - Claude-powered nightly validation against upstream docs
- **claude.yml** - Responds to @claude mentions in issues/PRs
- **claude-code-review.yml** - Automated code review on pull requests

The validation workflow ensures documented setup instructions, commands, and configurations remain accurate as upstream dependencies evolve.

## Development Commands

```bash
# Install dependencies
bun install

# Run website dev server (packages/website)
bun run dev

# Run CLI locally
bun --cwd packages/cli run dev

# Build packages
bun --cwd packages/website build
bun --cwd packages/cli build

# Project-wide scripts
bun run check
bun run typecheck
bun run format
```

## Important Notes

- Always use Bun (not npm/pnpm/yarn)
- Workspace dependencies live at the root via Bun workspaces
- Effect Language Service is configured - TypeScript is patched for Effect LSP support
- Website uses Next.js 16 App Router with MDX for documentation
- CLI uses Effect services (FileSystem, Path, HttpClient via FetchHttpClient)

## Workspace Configuration

The root `package.json` defines:
- `workspaces: ["packages/*"]`
- Scripts delegate to packages using `--cwd`

Both packages extend `tsconfig.base.json` which includes Effect Language Service plugin.
