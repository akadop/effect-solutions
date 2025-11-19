name: Effect Solutions
description: Guide for building robust Effect TypeScript applications. Use when setting up Effect projects, configuring TypeScript, choosing data types, handling errors, or applying Effect service patterns. Critical for ensuring type-safe Effect code and avoiding common pitfalls.
---

# Effect Solutions

This skill provides comprehensive guidance for building production-ready applications using Effect TypeScript.

## When to Use This Skill

Use this skill when:
- Setting up a new Effect TypeScript project
- Implementing error handling with Effect
- Configuring TypeScript for optimal Effect development
- Choosing appropriate Effect data types and structures
- Following Effect best practices and patterns
- Troubleshooting Effect-related type errors

## How to Use This Skill

### Reference Documentation

The CLI packages the entire `packages/website/references/` tree, so every markdown file ships with the skill:

- **00-index.md** – Overview and quick reference
- **01-repo-setup.md** – Effect Language Service + project bootstrap
- **02-tsconfig.md** – TypeScript configuration aligned with Effect
- **03-services-and-layers.md** – Dependency injection patterns
- **04-effect-style.md** – Coding conventions (`Effect.fn`, `Effect.gen`, imports)
- **05-data-types.md** – Schemas, unions, branded IDs, JSON interoperability
- **06-error-handling.md** – Tagged errors, matching, defects
- **07-config.md** – Using `Config` + layers for application settings

### Workflow

1. Identify the specific area (setup, error handling, data, config, etc.)
2. Read the relevant reference document from `references/`
3. Apply the patterns and guidance to the codebase
4. Verify type safety and best practice compliance, then rerun `effect-solutions` if distributing to Claude Code

## Key Principles

- Type safety first - leverage Effect's type system fully
- Explicit error handling - use Effect's error channels
- Composition over inheritance - build with Effect's combinators
- Resource safety - use Effect's resource management primitives
