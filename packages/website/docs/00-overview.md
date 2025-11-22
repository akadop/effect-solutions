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

<DocTopicsList />
