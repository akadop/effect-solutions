---
title: Incremental Adoption
description: "Strategies for gradually introducing Effect into existing codebases"
order: 9
draft: true
---

# Incremental Adoption

You don't need to rewrite your codebase to use Effect. Start at the boundaries, wrap existing Promise APIs, and migrate in layers while keeping tests green.

## The Boundary Pattern

Start Effect at your program's edges and gradually move inward. Effect code can call existing Promise-based code, and existing code can call Effect code.

```typescript
// Existing Promise-based API
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// New Effect wrapper (at the boundary)
const getUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetchUser(id),
    catch: (error) => FetchError.make({ error })
  })

// Use in Effect code
const program = Effect.gen(function* () {
  const user = yield* getUser("123")
  return user.name
})

// Run from existing Promise-based code
Effect.runPromise(program).then(console.log)
```

The boundary moves inward as you refactor more code to Effect.

## Effect ↔ Promise Interop

### Wrapping Promises

**Effect.promise** - For Promises guaranteed to succeed:
```typescript
const data = Effect.promise(() => Promise.resolve({ count: 42 }))
```

**Effect.tryPromise** - For Promises that may fail:
```typescript
const user = Effect.tryPromise({
  try: () => fetch("/api/user").then(r => r.json()),
  catch: (error) => NetworkError.make({ error })
})
```

### Running Effects as Promises

**Effect.runPromise** - Execute Effect and return Promise:
```typescript
// In existing Promise-based code
async function handler(req: Request) {
  const result = await Effect.runPromise(
    processRequest(req)
  )
  return Response.json(result)
}
```

## Lazy vs Eager Execution

Critical difference: Promises execute immediately, Effects execute when run.

```typescript
// Promise: Executes immediately (hot)
const promise = fetchData() // Already running!

// Effect: Executes when run (cold)
const effect = Effect.promise(() => fetchData()) // Not running yet

Effect.runPromise(effect) // Now it runs
```

Common pitfall: Forgetting `yield*` silently skips Effect execution.

```typescript
// ❌ Wrong: Effect.log never executes
Effect.gen(function* () {
  Effect.log("This won't appear")
})

// ✅ Correct: yield* executes the Effect
Effect.gen(function* () {
  yield* Effect.log("This appears")
})
```

## Migration Strategy

### 1. Wrap External Dependencies

Create Effect modules for external libraries:

```typescript
// services/gzip.ts
import { Context, Effect, Layer } from "effect"
import gunzip from "gunzip-file"

export class GzipError {
  readonly _tag = "GzipError"
  constructor(readonly cause: unknown) {}
}

export class Gzip extends Context.Tag("Gzip")<
  Gzip,
  {
    readonly extract: (params: {
      source: string
      dest: string
    }) => Effect.Effect<void, GzipError>
  }
>() {
  static Live = Layer.succeed(this, {
    extract: ({ source, dest }) =>
      Effect.async<void, GzipError>((resume) => {
        gunzip(source, dest, (error) => {
          if (error) {
            resume(GzipError.make(error))
          } else {
            resume(Effect.succeed(undefined))
          }
        })
      })
  })
}
```

### 2. Convert Functions Layer by Layer

Before (Promise-based):
```typescript
async function extractGzip(
  logger: Logger,
  gzipFilename: string,
  extractedFilename: string
): Promise<void> {
  if (fs.existsSync(extractedFilename)) {
    await logger.writeLn("using cached file")
    return
  }
  await gunzip(gzipFilename, extractedFilename)
}
```

After (Effect-based):
```typescript
const extractGzip = ({
  gzipFilename,
  extractedFilename
}: Params): Effect.Effect<
  void,
  PlatformError | GzipError,
  FileSystem | Gzip
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem
    const gzip = yield* Gzip

    const exists = yield* fs.exists(extractedFilename)
    if (exists) {
      return yield* Effect.logDebug("using cached file")
    }

    yield* gzip.extract({
      source: gzipFilename,
      dest: extractedFilename
    })
  })
```

Benefits:
- Errors explicit in type signature
- Dependencies injectable and mockable
- No global state

### 3. Provide Layers at Boundaries

```typescript
const program = extractGzip({
  gzipFilename: "archive.tar.gz",
  extractedFilename: "archive.tar"
}).pipe(
  Effect.provide(Layer.mergeAll(
    Gzip.Live,
    NodeFileSystem.layer
  ))
)

// Run at app edge
Effect.runPromise(program)
```

## Real-World Example: Inato Migration

[Inato migrated](https://medium.com/inato/how-we-migrated-our-codebase-from-fp-ts-to-effect-b71acd0c5640) 500k lines of TypeScript from fp-ts to Effect in 2 months.

**Strategy:**
- Dedicated 10% of team time
- New code written in Effect
- Existing code migrated opportunistically
- Result: 150 Effect use cases, rest migrated as needed

**Key insight:** "Any new code can be written using Effect while allowing existing code to coexist."

## Testing Mixed Codebases

Keep tests green during migration:

```typescript
// Test Effect code with vitest/jest
import { Effect } from "effect"
import { expect, test } from "vitest"

test("user lookup", async () => {
  const program = getUser("123")

  const result = await Effect.runPromise(program)

  expect(result.name).toBe("Alice")
})

// Or test Exit for error cases
test("handles missing user", async () => {
  const program = getUser("invalid")

  const exit = await Effect.runPromiseExit(program)

  expect(exit._tag).toBe("Failure")
})
```

## Integration Patterns

### HTTP Servers (Express/Fastify)

```typescript
// Express route handler
app.get("/users/:id", (req, res) => {
  const program = Effect.gen(function* () {
    const user = yield* getUser(req.params.id)
    const posts = yield* getUserPosts(user.id)
    return { user, posts }
  })

  Effect.runPromise(program)
    .then(data => res.json(data))
    .catch(error => res.status(500).json({ error }))
})
```

Consider migrating to `@effect/platform` for full Effect integration.

### Database Access

```typescript
// Wrap existing DB client
export class Database extends Context.Tag("Database")<
  Database,
  {
    readonly query: <A>(
      sql: string,
      params: unknown[]
    ) => Effect.Effect<A, DatabaseError>
  }
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const pool = createPool(config)

      return {
        query: (sql, params) =>
          Effect.tryPromise({
            try: () => pool.query(sql, params),
            catch: (error) => DatabaseError.make({ error })
          })
      }
    })
  )
}
```

### CLI Tools

```typescript
// Wrap existing CLI in Effect
const program = Effect.gen(function* () {
  const args = yield* parseArgs(process.argv)
  const config = yield* loadConfig(args.configPath)
  const result = yield* processFiles(config)
  yield* Effect.log(`Processed ${result.count} files`)
})

// Run at top level
Effect.runPromise(program).catch(console.error)
```

## When to Introduce Services

Start with plain functions, introduce services when you need:
- **Dependency injection** - Multiple implementations (test vs production)
- **State management** - Shared resources (connection pools, caches)
- **Effect composition** - Complex workflows with multiple dependencies

Don't prematurely introduce services for simple utilities.

## Common Pitfalls

**Forgetting yield\*** - Effects won't execute:
```typescript
// ❌ Wrong
Effect.gen(function* () {
  Effect.log("Not executed")
})

// ✅ Correct
Effect.gen(function* () {
  yield* Effect.log("Executed")
})
```

**Mixing hot and cold execution** - Promise starts before Effect runs:
```typescript
// ❌ Wrong: Promise already running
const fetchData = fetch("/api/data")
const effect = Effect.promise(() => fetchData)

// ✅ Correct: Promise starts when Effect runs
const effect = Effect.promise(() => fetch("/api/data"))
```

**Not handling scope** - Resources leak without proper cleanup:
```typescript
// ❌ Wrong: File handle might leak
Effect.gen(function* () {
  const file = yield* openFile("data.txt")
  const data = yield* readFile(file)
  return data // File never closed!
})

// ✅ Correct: acquireRelease guarantees cleanup
Effect.acquireRelease(
  openFile("data.txt"),
  (file) => closeFile(file)
).pipe(
  Effect.flatMap(file => readFile(file))
)
```

## Starting Points

1. **New features** - Write in Effect from the start
2. **API clients** - Wrap with `Effect.tryPromise`
3. **Database layer** - Create Effect service for existing client
4. **File operations** - Use `@effect/platform` or wrap Node.js APIs
5. **Error-prone code** - Refactor areas with poor error handling

Start small, measure impact, expand gradually.

## Resources

- [Effect vs Promise](https://effect.website/docs/additional-resources/effect-vs-promise/)
- [Sandro Maglione: TypeScript with and without Effect](https://www.sandromaglione.com/articles/typescript-code-with-and-without-effect)
- [Gentle Introduction to Effect](https://blog.mavnn.co.uk/2024/09/16/intro_to_effect_ts.html)
- [Inato Migration Story](https://medium.com/inato/how-we-migrated-our-codebase-from-fp-ts-to-effect-b71acd0c5640)
- [Effect Documentation](https://effect.website/)
