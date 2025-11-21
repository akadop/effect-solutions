---
title: Overview
description: "Map of all Effect Solutions references with quick links"
order: 0
---

# Effect Solutions

Effect Solutions is a comprehensive guide for humans and AI agents to understand best practices and patterns when building applications with the Effect library. This resource covers everything from initial project setup through advanced patterns for dependency injection, error handling, and data modeling.

## Agent Quick Start

Copy these instructions to share with your AI assistant. They'll explain how to use the CLI and interact with Effect Solutions documentation. Just paste this into any agent session and it should guide you through the rest.

<div className="flex justify-center my-8">
  <LLMInstructionsButton />
</div>

## CLI Usage

Install globally for easy access everywhere:

```bash
bun add -g effect-solutions@latest
```

Then use the CLI:

```bash
# List topics
effect-solutions list

# Show specific topics
effect-solutions show project-setup tsconfig

# Show all topics at once
effect-solutions show --all
```

Without global install, use `bunx effect-solutions@latest <command>`.

## Core Topics

### [Project Setup](/project-setup)
Configure the Effect Language Service for enhanced TypeScript diagnostics and IntelliSense. Covers installation via LSP CLI patch, VSCode settings, and verification steps to ensure your editor provides real-time Effect-specific type checking.

### [TypeScript Config](/tsconfig)
Recommended TypeScript compiler options optimized for Effect development. Includes strict mode flags, module resolution settings, and Effect-specific configuration that ensures type safety and proper inference across your codebase.

### [Services & Layers](/services-and-layers)
Dependency injection patterns using Effect's Context and Layer system. Learn how to define services with `Context.Tag`, implement them with `Layer.succeed` or `Layer.effect`, compose layers, and manage dependencies in a type-safe, testable way.

### [Core Patterns](/effect-style)
Writing idiomatic Effect code including pipe-based composition, generator syntax with `Effect.gen`, choosing between `Effect.all` and generators, and when to use `Do` notation. Covers common patterns that make Effect code readable and maintainable.

### [Data Types](/data-types)
Branded types for semantic type safety, Schema-based validation and serialization, and generating type-safe unique identifiers. Includes patterns for domain modeling that leverage Effect's ecosystem to prevent invalid states at compile time.

### [Error Handling](/error-handling)
Structured error handling with `Data.TaggedError`, understanding `Cause` for failure inspection, and pattern matching on errors using `Effect.match`. Covers how to model expected failures in the type system and handle unexpected errors gracefully.

### [Configuration](/config)
Application configuration using Effect's `Config` module. Learn how to define typed configuration with defaults, validation, and environment variable mapping that integrates seamlessly with your Effect services and layers.

<DraftNote>

### [Project Structure](/project-structure)
Folder organization patterns for Effect applications

### [Incremental Adoption](/incremental-adoption)
Gradually introducing Effect to existing codebases

</DraftNote>
