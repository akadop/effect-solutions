---
title: Project Setup
description: "Install the Effect Language Service and strict project defaults"
order: 1
---

# Project Setup

This guide covers:
1. Effect Language Service: Editor diagnostics and build-time type checking
2. LLM Context Directory: Local reference repositories for AI assistance

For a well-configured Effect project, install the Effect Language Service and set up local context for AI-assisted development.

## Effect Language Service

The Effect Language Service provides editor diagnostics and compile-time type checking. This guide covers installation and setup.

### Installation

```bash
bun add -d @effect/language-service
```

Add the plugin to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@effect/language-service"
      }
    ]
  }
}
```

### VS Code Setup

For VS Code or any VS Code fork (Cursor, etc.):

1. Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

2. Press F1 → "TypeScript: Select TypeScript version"
3. Choose "Use workspace version"

### Enable Build-Time Diagnostics

Patch TypeScript to get Effect diagnostics during compilation:

```bash
bunx effect-language-service patch
```

Add to `package.json` to persist across installs:

```json
{
  "scripts": {
    "prepare": "effect-language-service patch"
  }
}
```

**Full guide:** [Effect Language Service](https://github.com/Effect-TS/language-service)

## Effect Solutions CLI

Access Effect Solutions documentation directly from the command line:

```bash
# List all topics
bunx effect-solutions@latest list

# Show specific topics
bunx effect-solutions@latest show project-setup tsconfig

# Show all topics at once
bunx effect-solutions@latest show --all
```

For AI assistants, add to `CLAUDE.md` or `AGENTS.md`:

```markdown
# Effect TypeScript

Use Effect Solutions CLI before working with Effect code:
- List topics: `bunx effect-solutions@latest list`
- Show docs: `bunx effect-solutions@latest show <topic>`
- Apply patterns from docs, don't guess
```

## LLM Context Directory

For repos where you work with AI agents (Claude, Cursor, etc.), use a `.context/` folder pattern:

- **Track the folder** in git, but **ignore its contents**
- Clone reference repos here (Effect core, related libraries, etc.) for LLM traversal
- The LLM can read upstream code/docs without polluting your git history

**Setup:**

In `.gitignore`:
```gitignore
# Local LLM context (tracked folder, ignored contents)
.context/*
!.context/.gitkeep
```

In `CLAUDE.md` or `AGENTS.md`:
```markdown
## LLM Context Workspace

- This repo uses `.context/` for local reference clones
- Typical entries:
  - `effect`: main Effect repo
  - `effect-solutions`: best practices repo
  - Any app/stack-specific references
- Tell agents: "Additional code/docs live under `.context/`"
```

Then clone reference repos:
```bash
cd .context
git clone https://github.com/Effect-TS/effect.git
```

This keeps your workspace clean while giving agents access to upstream sources.

## TypeScript Configuration

Effect projects benefit from strict TypeScript configuration for safety and performance.

**See:** [TypeScript Configuration Guide](./02-tsconfig.md)

Reference configuration from Effect v4:
[effect-smol tsconfig.base.jsonc](https://github.com/Effect-TS/effect-smol/blob/main/tsconfig.base.jsonc)
