---
title: Incremental Adoption
description: "Strategies for gradually introducing Effect into existing codebases"
order: 9
draft: true
---

# Incremental Adoption

Strategies for weaving Effect into an existing codebase without big-bang rewrites: start at the boundaries, wrap promise APIs, and migrate services in slices while tests stay green.

## TODO

- Start small: wrap existing async functions with Effect.tryPromise
- Boundary pattern: Effect at edges, gradually move inward
- Converting Promise-based code to Effect progressively
- Interop strategies:
  - Effect.promise for running Effects in Promise contexts
  - Effect.runPromise for running Effects from non-Effect code
  - Effect.tryPromise for wrapping existing Promise APIs
- When to introduce services vs keeping plain functions
- Migration path for existing DI patterns (class constructors, factory functions)
- How to handle mixed codebases (some Effect, some not)
- Testing strategy during migration
- Common pitfalls and how to avoid them
- Real-world examples:
  - Adding Effect to Express/Fastify apps
  - Converting existing REST clients
  - Migrating database access layer
  - Refactoring CLI tools progressively
