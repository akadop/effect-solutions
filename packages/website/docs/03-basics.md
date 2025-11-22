---
title: Basics
description: "Coding conventions for Effect.fn and Effect.gen"
order: 3
---

# Basics

Guidelines for how we structure Effect code: how to express sequencing with `Effect.gen`, and when to name effectful functions with `Effect.fn`.

## Effect.gen for Sequential Operations

```typescript
import { Effect } from "effect";

const fetchData = (): Effect.Effect<string> => Effect.succeed("data");
const processData = (data: string): Effect.Effect<string> =>
  Effect.succeed(data.toUpperCase());
const saveData = (data: string): Effect.Effect<void> => Effect.void;

const program = Effect.gen(function* () {
  const data = yield* fetchData();
  const processed = yield* processData(data);
  return yield* saveData(processed);
});
```

**Prefer `Effect.gen` over `.pipe` with `flatMap`:**

```typescript
import { Effect } from "effect";

const getA = (): Effect.Effect<number> => Effect.succeed(1);
const getB = (a: number): Effect.Effect<string> =>
  Effect.succeed(`Result: ${a}`);

// ✅ Good - readable, sequential
const goodProgram = Effect.gen(function* () {
  const a = yield* getA();
  const b = yield* getB(a);
  return b;
});

// ❌ Avoid - nested, harder to read
const badProgram = getA().pipe(Effect.flatMap((a) => getB(a)));
```

## Effect.fn

Use `Effect.fn` with generator functions for traced, named effects:

```typescript
import { Effect } from "effect";

interface User {
  id: string;
  name: string;
}

const getUser = Effect.fn("getUser")(function* (userId: string) {
  return { id: userId, name: "Test User" };
});

const processData = Effect.fn("processData")(function* (user: User) {
  return user;
});

const processUser = Effect.fn("processUser")(function* (userId: string) {
  const user = yield* getUser(userId);
  const processed = yield* processData(user);
  return processed;
});

// Usage
const program = Effect.gen(function* () {
  const result = yield* processUser("user-123");
  return result;
});
```

**Benefits:**

- Named spans for tracing/debugging
- Stack traces with location details
- Clean signatures
- Better type inference
