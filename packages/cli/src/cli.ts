#!/usr/bin/env bun

import { BunContext, BunRuntime } from "@effect/platform-bun";
import { FileSystem, Path } from "@effect/platform";
import { Console, Effect } from "effect";
import { Command, Options } from "@effect/cli";
import {
  REFERENCE_CONTENT,
  REFERENCE_FILES,
  SKILL_DOCUMENT,
} from "./reference-manifest";

const CLI_NAME = "effect-solutions";
const CLI_VERSION = "0.1.0";

const installSkill = (global: boolean) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const skillName = "effect-best-practices";
    const homeDir = yield* Effect.promise(() => import("node:os")).pipe(
      Effect.map((os) => os.homedir()),
    );

    const targetDir = global
      ? path.join(homeDir, ".claude", "skills", skillName)
      : path.join(path.join(process.cwd()), ".claude", "skills", skillName);

    yield* Console.log(
      `Installing Effect Best Practices skill to ${targetDir}...`,
    );

    // Create directories
    yield* fs.makeDirectory(path.join(targetDir, "references"), {
      recursive: true,
    });

    // Write SKILL.md locally bundled in the CLI
    yield* fs.writeFileString(path.join(targetDir, "SKILL.md"), SKILL_DOCUMENT);

    for (const ref of REFERENCE_FILES) {
      const destination = path.join(targetDir, "references", ref);
      yield* fs.makeDirectory(path.dirname(destination), { recursive: true });
      yield* fs.writeFileString(destination, REFERENCE_CONTENT[ref]);
    }

    yield* Console.log("✓ Effect Best Practices skill installed successfully!");
    yield* Console.log("\nRestart Claude Code to activate the skill.");
  });

const globalOption = Options.boolean("global").pipe(
  Options.withAlias("g"),
  Options.withDescription("Install globally to ~/.claude/skills/"),
);

const installCommand = Command.make("install", { global: globalOption }).pipe(
  Command.withHandler(({ global }) => installSkill(global)),
  Command.withDescription("Install the Effect Best Practices skill"),
);

export const cli = Command.make(CLI_NAME).pipe(
  Command.withSubcommands([installCommand]),
  Command.withDescription("Effect Best Practices CLI"),
);

export const runCli = (argv: ReadonlyArray<string>) =>
  Command.run(cli, {
    name: CLI_NAME,
    version: CLI_VERSION,
  })(argv);

if (import.meta.main) {
  runCli(process.argv).pipe(
    Effect.provide(BunContext.layer),
    BunRuntime.runMain,
  );
}
