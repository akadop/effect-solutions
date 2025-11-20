# Effect Solutions

**Effect best practices and patterns** — https://www.effect.solutions

> **Living Document**: Opinionated collection exploiting Cunningham's Law. Disagree? [Open an issue](https://github.com/kitlangton/effect-solutions/issues/new)

## What is this?

Curated Effect TypeScript patterns for common scenarios — error handling, services, layers, testing, and more. For humans and AI agents.

## Usage

**Website**: Browse at [effect.solutions](https://www.effect.solutions)

**CLI**: Access docs offline
```bash
bunx effect-solutions list              # List all topics
bunx effect-solutions show http-clients # Show specific topic
bunx effect-solutions search error      # Search topics
```

**Claude MCP**: Install server for Claude Desktop
```bash
bunx effect-solutions-mcp install
```

## Features

- **Practical patterns** - Real-world solutions, not just theory
- **Type-safe examples** - All code validated with Effect LSP
- **AI-friendly** - Structured for LLM consumption via CLI/MCP
- **Community-driven** - Open issues to suggest/debate patterns

## Quick Examples

**Error handling**
```typescript
Effect.gen(function* () {
  const user = yield* findUser(id).pipe(
    Effect.catchTag("NotFound", () => Effect.succeed(null))
  )
})
```

**HTTP client setup**
```typescript
const program = Effect.gen(function* () {
  const http = yield* HttpClient.HttpClient
  const result = yield* http.get("/api/users")
})

program.pipe(
  Effect.provide(FetchHttpClient.layer)
)
```

See [effect.solutions](https://www.effect.solutions) for full patterns and rationale.

## Contributing

1. Find a missing pattern or disagree with a recommendation
2. [Open an issue](https://github.com/kitlangton/effect-solutions/issues/new) to discuss
3. Submit PR with pattern + tests
4. Create changeset: `bunx changeset`

See [CLAUDE.md](./CLAUDE.md) for development details.

## Packages

- `effect-solutions` - CLI for local docs
- `effect-solutions-mcp` - MCP server for Claude
- Website at [effect.solutions](https://www.effect.solutions)

## License

MIT
