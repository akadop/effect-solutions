import {
  Command,
  type CommandExecutor,
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import {
  Console,
  Context,
  Effect,
  Layer,
  Option,
  Schedule,
  Stream,
} from "effect";
import {
  getBaseUrl,
  NEXT_CACHE_DIR,
  SERVER_PORT,
  TEMPLATE_ROUTE,
} from "./config.js";

// =============================================================================
// Server Handle
// =============================================================================

interface ServerHandle {
  baseUrl: string;
  process: CommandExecutor.Process | null;
}

// =============================================================================
// HTTP Helpers
// =============================================================================

const checkServer = (url: string) =>
  HttpClient.execute(HttpClientRequest.get(url)).pipe(
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.as(true),
    Effect.catchAll(() => Effect.succeed(false)),
    Effect.provide(FetchHttpClient.layer),
  );

// =============================================================================
// Server Discovery
// =============================================================================

const findExistingDevServer = Effect.gen(function* () {
  const candidates = [
    process.env.NEXT_DEFAULT_DEV_BASE_URL,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const url = new URL(TEMPLATE_ROUTE, candidate).toString();
    const reachable = yield* checkServer(url).pipe(Effect.timeout("1 second"));
    if (reachable) {
      return Option.some(candidate.replace(/\/$/, ""));
    }
  }

  return Option.none();
});

const waitForServer = (url: string) =>
  checkServer(url).pipe(
    Effect.filterOrFail(
      (ok) => ok,
      () => new Error("Server not ready"),
    ),
    Effect.retry(Schedule.spaced("500 millis")),
    Effect.timeout("45 seconds"),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(
        new Error(`Timed out waiting for Next.js dev server at ${url}`),
      ),
    ),
  );

// =============================================================================
// Server Lifecycle
// =============================================================================

const startDevServer = Effect.gen(function* () {
  const baseUrl = `http://127.0.0.1:${SERVER_PORT}`;

  yield* Console.log(
    `Starting temporary Next.js server for OG template on ${baseUrl}...`,
  );

  const command = Command.make(
    "bunx",
    "next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(SERVER_PORT),
  ).pipe(
    Command.workingDirectory(process.cwd()),
    Command.env({
      BROWSER: "none",
      NEXT_CACHE_DIR,
    }),
    Command.stderr("inherit"),
  );

  // Command.start is already scoped - process killed when scope closes
  const proc = yield* Command.start(command);

  // Pipe stdout to console with prefix
  yield* proc.stdout
    .pipe(
      Stream.decodeText(),
      Stream.runForEach((chunk) =>
        Effect.sync(() => process.stdout.write(`[og-dev] ${chunk}`)),
      ),
    )
    .pipe(Effect.fork);

  // Wait for server to be ready
  yield* waitForServer(new URL(TEMPLATE_ROUTE, baseUrl).toString());

  return { baseUrl, process: proc } satisfies ServerHandle;
});

const acquireServer = Effect.gen(function* () {
  // Check for explicit base URL
  const explicitBaseUrl = getBaseUrl();
  if (explicitBaseUrl) {
    return { baseUrl: explicitBaseUrl, process: null } satisfies ServerHandle;
  }

  // Check for existing dev server
  const existing = yield* findExistingDevServer;
  if (Option.isSome(existing)) {
    yield* Console.log(`Reusing existing dev server at ${existing.value}`);
    return { baseUrl: existing.value, process: null } satisfies ServerHandle;
  }

  // Start a new dev server
  return yield* startDevServer;
});

// =============================================================================
// Template Server Service
// =============================================================================

export class TemplateServer extends Context.Tag("TemplateServer")<
  TemplateServer,
  { readonly baseUrl: string }
>() {
  static layer = Layer.scoped(
    TemplateServer,
    acquireServer.pipe(Effect.map((handle) => ({ baseUrl: handle.baseUrl }))),
  );

  static test = (baseUrl: string) =>
    Layer.succeed(TemplateServer, TemplateServer.of({ baseUrl }));
}
