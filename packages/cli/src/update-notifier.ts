import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Console, Effect, Option } from "effect";

const CHECK_INTERVAL_MS = 1000 * 60 * 60 * 24; // daily
const TIMEOUT_MS = 3_000;

type CacheFile = {
  latest: string;
  nextCheck: number;
};

const isCiLike = () =>
  Boolean(process.env.CI || process.env.NODE_ENV === "test");

const homeDir = () => process.env.HOME ?? os.homedir();

/**
 * Compare semver versions. Returns true if `latest` > `current`.
 */
export const isNewer = (latest: string, current: string): boolean => {
  const parseParts = (v: string) =>
    v.split(".").map((x) => Number.parseInt(x, 10) || 0);

  const [latestMajor = 0, latestMinor = 0, latestPatch = 0] =
    parseParts(latest);
  const [currentMajor = 0, currentMinor = 0, currentPatch = 0] =
    parseParts(current);

  if (latestMajor !== currentMajor) return latestMajor > currentMajor;
  if (latestMinor !== currentMinor) return latestMinor > currentMinor;
  return latestPatch > currentPatch;
};

const cachePath = (pkgName: string) =>
  path.join(homeDir(), ".config", pkgName, "update.json");

const readCache = (file: string) =>
  Effect.tryPromise({
    try: () => readFile(file, "utf8"),
    catch: () => null,
  }).pipe(
    Effect.flatMap((raw) =>
      raw
        ? Effect.try({
            try: () => Option.some(JSON.parse(raw) as CacheFile),
            catch: () => Option.none<CacheFile>(),
          })
        : Effect.succeed(Option.none()),
    ),
    Effect.catchAll(() => Effect.succeed(Option.none())),
  );

const writeCache = (file: string, data: CacheFile) =>
  Effect.tryPromise({
    try: async () => {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(data), "utf8");
    },
    catch: () => {},
  }).pipe(Effect.catchAll(() => Effect.void));

const fetchLatest = (pkgName: string) =>
  Effect.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(
          `https://registry.npmjs.org/${encodeURIComponent(pkgName)}/latest`,
          { signal: controller.signal },
        );
        if (!res.ok) return Option.none<string>();
        const json = (await res.json()) as { version?: string };
        return json.version ? Option.some(json.version) : Option.none<string>();
      } finally {
        clearTimeout(timer);
      }
    },
    catch: () => Option.none<string>(),
  }).pipe(Effect.catchAll(() => Effect.succeed(Option.none())));

const logUpdate = (current: string, latest: string, pkgName: string) =>
  Console.log(
    [
      `Update available for ${pkgName}: ${current} → ${latest}`,
      `Run: bun add -g ${pkgName}@latest`,
    ].join("\n"),
  );

export const maybeNotifyUpdate = (pkgName: string, currentVersion: string) =>
  Effect.gen(function* () {
    if (isCiLike()) return;

    const now = Date.now();
    const file = cachePath(pkgName);

    const cache = yield* readCache(file);
    if (Option.isSome(cache)) {
      const cached = cache.value;
      if (cached.nextCheck > now) {
        if (isNewer(cached.latest, currentVersion)) {
          yield* logUpdate(currentVersion, cached.latest, pkgName);
        }
        return;
      }
    }

    const latest = yield* fetchLatest(pkgName);
    if (Option.isNone(latest)) return;

    const latestVersion = latest.value;
    yield* writeCache(file, {
      latest: latestVersion,
      nextCheck: now + CHECK_INTERVAL_MS,
    });

    if (isNewer(latestVersion, currentVersion)) {
      yield* logUpdate(currentVersion, latestVersion, pkgName);
    }
  }).pipe(Effect.catchAll(() => Effect.void));
