/// <reference types="node" />

import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Browser as PlaywrightBrowser } from "playwright";
import { chromium } from "playwright";

import { Console, Context, Effect, Layer, Option, pipe } from "effect";
import { getAllDocs } from "../src/lib/mdx";

// =============================================================================
// Configuration
// =============================================================================

const VIEWPORT = { width: 1200, height: 630 };
const DEFAULT_DEVICE_SCALE = Number(process.env.OG_DEVICE_SCALE ?? 2);
const DEFAULT_CONCURRENCY = Number(process.env.OG_CONCURRENCY ?? 5);
const OUTPUT_DIR = path.join(process.cwd(), "public", "og");
const NEXT_CACHE_DIR = path.join(process.cwd(), ".next-og");
const TEMPLATE_ROUTE = "/og/template";

// =============================================================================
// Types
// =============================================================================

interface TemplateFields {
  slug: string;
  title: string;
  subtitle?: string;
  background?: string;
}

interface TemplateServerHandle {
  baseUrl: string;
  close: Effect.Effect<void>;
}

// =============================================================================
// Browser Service
// =============================================================================

class Browser extends Context.Tag("Browser")<Browser, PlaywrightBrowser>() {
  static layer = Layer.scoped(
    Browser,
    Effect.acquireRelease(
      Effect.tryPromise({
        try: () => chromium.launch(),
        catch: (error) => new Error(`Failed to launch browser: ${error}`),
      }),
      (browser) =>
        Effect.promise(() => browser.close()).pipe(
          Effect.tap(() => Console.log("Browser closed")),
        ),
    ),
  );
}

// =============================================================================
// Spec Building
// =============================================================================

const buildDocSpecs = (): TemplateFields[] => {
  const docs = getAllDocs();
  const docSpecs = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    subtitle:
      doc.description ?? "Best practices for applying Effect in production.",
  }));

  const homeSpec: TemplateFields = {
    slug: "home",
    title: "Effect Solutions",
    subtitle: "Best practices for building Effect TypeScript applications",
  };

  return [homeSpec, ...docSpecs];
};

const dedupeSpecs = (specs: TemplateFields[]) =>
  Effect.gen(function* () {
    const seen = new Set<string>();
    const unique: TemplateFields[] = [];

    for (const spec of specs) {
      if (seen.has(spec.slug)) {
        yield* Console.warn(`Skipping duplicate OG slug: ${spec.slug}`);
        continue;
      }
      seen.add(spec.slug);
      unique.push(spec);
    }

    return unique;
  });

const pickSpecs = Effect.gen(function* () {
  const only = (process.env.OG_ONLY ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  const specs = yield* dedupeSpecs(buildDocSpecs());

  if (only.length === 0) {
    return specs;
  }

  const filtered = specs.filter((spec) => only.includes(spec.slug));
  if (filtered.length === 0) {
    yield* Console.warn(
      `No OG specs matched OG_ONLY filter (${only.join(", ")}). Falling back to complete set.`,
    );
    return specs;
  }

  return filtered;
});

// =============================================================================
// Screenshot Capture
// =============================================================================

const captureSpec = (spec: TemplateFields, baseUrl: string) =>
  Effect.gen(function* () {
    const browser = yield* Browser;

    const page = yield* Effect.tryPromise(() =>
      browser.newPage({
        viewport: VIEWPORT,
        deviceScaleFactor: DEFAULT_DEVICE_SCALE,
      }),
    );

    yield* Effect.acquireRelease(
      Effect.succeed(page),
      (p) => Effect.promise(() => p.close()),
    ).pipe(
      Effect.flatMap((page) =>
        Effect.gen(function* () {
          const templateURL = new URL(TEMPLATE_ROUTE, baseUrl);
          const params = templateURL.searchParams;
          params.delete("slug");

          for (const [key, value] of Object.entries(spec)) {
            if (key !== "slug" && value) {
              params.set(key, value);
            }
          }

          yield* Effect.tryPromise(() =>
            page.goto(templateURL.toString(), { waitUntil: "load" }),
          );

          const filePath = path.join(OUTPUT_DIR, `${spec.slug}.png`);
          yield* Effect.tryPromise(() =>
            page.screenshot({ path: filePath, type: "png" }),
          );

          yield* Console.log(
            `OG image generated: ${path.relative(process.cwd(), filePath)}`,
          );
        }),
      ),
      Effect.scoped,
    );
  });

// =============================================================================
// Server Management
// =============================================================================

const isServerReachable = (url: string, timeoutMs = 2_000) =>
  Effect.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        return res.ok;
      } finally {
        clearTimeout(timer);
      }
    },
    catch: () => false,
  }).pipe(Effect.catchAll(() => Effect.succeed(false)));

const findExistingDevServer = Effect.gen(function* () {
  const candidates = [
    process.env.NEXT_DEFAULT_DEV_BASE_URL,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const url = new URL(TEMPLATE_ROUTE, candidate).toString();
    const reachable = yield* isServerReachable(url, 1_000);
    if (reachable) {
      return Option.some(candidate.replace(/\/$/, ""));
    }
  }

  return Option.none();
});

const waitForServer = (url: string, timeoutMs = 45_000) =>
  Effect.gen(function* () {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const reachable = yield* isServerReachable(url);
      if (reachable) {
        return;
      }
      yield* Effect.sleep(500);
    }

    yield* Effect.fail(
      new Error(`Timed out waiting for Next.js dev server at ${url}`),
    );
  });

const startDevServer = Effect.gen(function* () {
  const port = Number(process.env.OG_SERVER_PORT ?? 4311);
  yield* Console.log(
    `Starting temporary Next.js server for OG template on http://127.0.0.1:${port}...`,
  );

  yield* Effect.sync(() =>
    fs.rmSync(NEXT_CACHE_DIR, { recursive: true, force: true }),
  );
  const distDir = path.join(process.cwd(), `.next-og-dist-${Date.now()}`);

  const child: ChildProcess = spawn(
    "bunx",
    ["next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BROWSER: "none",
        NEXT_CACHE_DIR,
        NEXT_DIST_DIR: distDir,
      },
      stdio: "pipe",
    },
  );

  child.stdout?.on("data", (chunk) => {
    process.stdout.write(`[og-dev] ${chunk}`);
  });
  child.stderr?.on("data", (chunk) => {
    process.stderr.write(`[og-dev] ${chunk}`);
  });

  const baseUrl = `http://127.0.0.1:${port}`;

  // Wait for server to be ready, racing against early exit
  yield* Effect.raceFirst(
    waitForServer(new URL(TEMPLATE_ROUTE, baseUrl).toString()),
    Effect.async<never, Error>((resume) => {
      child.once("exit", (code) => {
        resume(
          Effect.fail(
            new Error(`Next dev server exited early (code ${code ?? "null"})`),
          ),
        );
      });
    }),
  );

  const handle: TemplateServerHandle = {
    baseUrl,
    close: Effect.gen(function* () {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
      yield* Effect.async<void>((resume) => {
        child.once("exit", () => resume(Effect.succeed(undefined)));
      });
      yield* Effect.sync(() => {
        fs.rmSync(NEXT_CACHE_DIR, { recursive: true, force: true });
        fs.rmSync(distDir, { recursive: true, force: true });
      });
    }),
  };

  return handle;
});

const ensureTemplateServer = Effect.gen(function* () {
  // Check for explicit base URL
  const explicit = process.env.OG_BASE_URL;
  if (explicit) {
    return {
      baseUrl: explicit.trim().replace(/\/$/, ""),
      close: Effect.void,
    } satisfies TemplateServerHandle;
  }

  // Check for existing dev server
  const existing = yield* findExistingDevServer;
  if (Option.isSome(existing)) {
    yield* Console.log(`Reusing existing dev server at ${existing.value}`);
    return {
      baseUrl: existing.value,
      close: Effect.void,
    } satisfies TemplateServerHandle;
  }

  // Start a new dev server
  return yield* startDevServer;
});

// =============================================================================
// Main Program
// =============================================================================

const program = Effect.gen(function* () {
  yield* Effect.sync(() => fs.mkdirSync(OUTPUT_DIR, { recursive: true }));

  const specs = yield* pickSpecs;
  if (specs.length === 0) {
    yield* Console.warn("No OG specs detected. Nothing to do.");
    return;
  }

  const server = yield* ensureTemplateServer;
  yield* Console.log(
    `Using OG template at ${new URL(TEMPLATE_ROUTE, server.baseUrl).toString()}`,
  );

  yield* Console.log(
    `Generating ${specs.length} OG image(s) with concurrency ${DEFAULT_CONCURRENCY}...`,
  );

  yield* Effect.forEach(
    specs,
    (spec) => captureSpec(spec, server.baseUrl),
    { concurrency: DEFAULT_CONCURRENCY },
  );

  yield* server.close;
  yield* Console.log("OG generation complete.");
});

// =============================================================================
// Run
// =============================================================================

pipe(
  program,
  Effect.provide(Browser.layer),
  Effect.catchAll((error) =>
    Console.error(`Error: ${error}`).pipe(
      Effect.flatMap(() => Effect.sync(() => process.exit(1))),
    ),
  ),
  Effect.runPromise,
);
