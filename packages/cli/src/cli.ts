#!/usr/bin/env bun

import { Args, Command, Options } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect, Option, pipe } from "effect";
import pc from "picocolors";
import pkg from "../package.json" with { type: "json" };
import { DOC_LOOKUP, DOCS } from "./docs-manifest";
import {
  type BrowserOpenStrategy,
  type OpenIssueCategory,
  openIssue,
} from "./open-issue-service";
import { maybeNotifyUpdate } from "./update-notifier";

const CLI_NAME = "effect-solutions";
const CLI_VERSION = pkg.version;

const isDocSlug = (value: string): value is keyof typeof DOC_LOOKUP =>
  value in DOC_LOOKUP;

const colorizeCodeReferences = (text: string): string => {
  return (
    text
      // Commands in bold green
      .replace(/`bunx [^`]+`/g, (match) => pc.bold(pc.green(match)))
      .replace(/`bun run [^`]+`/g, (match) => pc.bold(pc.green(match)))
      // File references in cyan
      .replace(/`[^`]+\.(ts|json|toml|md)`/g, (match) => pc.cyan(match))
      // Other code in dim
      .replace(/`[^`]+`/g, (match) => pc.dim(match))
  );
};

const MIN_TERMINAL_WIDTH = 40;
const FALLBACK_TERMINAL_WIDTH = 80;
const MIN_DESCRIPTION_WIDTH = 20;

const getTerminalWidth = () => {
  const width =
    typeof process.stdout?.columns === "number"
      ? process.stdout.columns
      : FALLBACK_TERMINAL_WIDTH;
  return Math.max(MIN_TERMINAL_WIDTH, width);
};

const wrapText = (text: string, maxWidth: number) => {
  if (text.trim() === "" || maxWidth <= 0) {
    return [text];
  }

  const words = text.split(/\s+/);
  const lines: Array<string> = [];
  let current = "";

  for (const word of words) {
    if (current.length === 0) {
      current = word;
      continue;
    }

    if (current.length + 1 + word.length <= maxWidth) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
};

export const renderDocList = () => {
  const indent = "  ";
  const width = getTerminalWidth();
  const descriptionWidth = Math.max(
    MIN_DESCRIPTION_WIDTH,
    width - indent.length,
  );

  const cards = DOCS.map((doc) => {
    const titleLine = `${pc.green(doc.slug)}  ${pc.bold(pc.cyan(doc.title))}`;
    const wrappedDescription = wrapText(doc.description, descriptionWidth).map(
      (line) => `${indent}${pc.dim(line)}`,
    );

    return [titleLine, ...wrappedDescription].join("\n");
  });

  return `${cards.join("\n\n")}\n`;
};

export const renderDocs = (requested: ReadonlyArray<string>) => {
  const slugs = requested.map((slug) => slug.trim()).filter(Boolean);

  if (slugs.length === 0) {
    throw new Error("Please provide at least one doc slug.");
  }

  const unknown = slugs.filter((slug) => !isDocSlug(slug));
  if (unknown.length > 0) {
    throw new Error(`Unknown doc slug(s): ${unknown.join(", ")}`);
  }

  const uniqueSlugs = Array.from(new Set(slugs)) as Array<
    keyof typeof DOC_LOOKUP
  >;
  const blocks = uniqueSlugs.map((slug) => {
    const doc = DOC_LOOKUP[slug];
    if (!doc) {
      throw new Error(`Internal error: doc ${slug} not found in lookup`);
    }
    const title = `${pc.bold(pc.cyan(`## ${doc.title}`))} ${pc.dim(`(${doc.slug})`)}`;
    const body = colorizeCodeReferences(doc.body.trim());
    return [title, "", body].filter(Boolean).join("\n");
  });

  return `${blocks.join(`\n\n${pc.dim("---")}\n\n`)}\n`;
};

const listDocs = Console.log(renderDocList());

const showDocs = (slugs: ReadonlyArray<string>) =>
  Effect.try(() => renderDocs(slugs)).pipe(
    Effect.flatMap((output) => Console.log(output)),
  );

const listCommand = Command.make("list").pipe(
  Command.withDescription("List Effect Solutions documentation"),
  Command.withHandler(() => listDocs),
);

const showCommand = Command.make("show", {
  slugs: Args.text({ name: "slug" }).pipe(Args.atLeast(1)),
}).pipe(
  Command.withDescription("Show one or more Effect Solutions docs"),
  Command.withHandler(({ slugs }) => showDocs(slugs)),
);

const openIssueCommand = Command.make("open-issue", {
  category: Options.text("category").pipe(Options.optional),
  title: Options.text("title").pipe(Options.optional),
  description: Options.text("description").pipe(Options.optional),
  strategy: Options.text("strategy").pipe(Options.optional),
}).pipe(
  Command.withDescription(
    "Open a pre-filled GitHub issue in the effect-solutions repo",
  ),
  Command.withHandler(({ category, title, description, strategy }) =>
    Effect.sync(() => {
      const categoryValue = Option.getOrUndefined(category);
      const titleValue = Option.getOrUndefined(title);
      const descriptionValue = Option.getOrUndefined(description);
      const strategyValue = Option.getOrUndefined(strategy);

      return openIssue({
        category: categoryValue as OpenIssueCategory | undefined,
        title: titleValue,
        description: descriptionValue,
        ...(strategyValue
          ? { strategy: strategyValue as BrowserOpenStrategy }
          : {}),
      });
    }).pipe(
      Effect.flatMap((result) =>
        Console.log(
          [
            pc.bold("Effect Solutions issue"),
            `URL: ${pc.cyan(result.issueUrl)}`,
            `Opened: ${result.opened ? pc.green("yes") : pc.yellow("no")} (${result.openedWith})`,
            result.message,
          ].join("\n"),
        ),
      ),
    ),
  ),
);

export const cli = Command.make(CLI_NAME).pipe(
  Command.withDescription(
    "Effect Solutions CLI - Browse and search Effect best practices documentation. " +
      "Built for both humans and AI agents to quickly access Effect patterns, setup guides, and configuration examples.",
  ),
  Command.withSubcommands([listCommand, showCommand, openIssueCommand]),
);

export const runCli = (argv: ReadonlyArray<string>) =>
  Command.run(cli, {
    name: CLI_NAME,
    version: CLI_VERSION,
  })(argv);

if (import.meta.main) {
  pipe(
    maybeNotifyUpdate(CLI_NAME, CLI_VERSION),
    Effect.zipRight(runCli(process.argv)),
    Effect.provide(BunContext.layer),
    Effect.tapErrorCause((cause) => Console.error(pc.red(`Error: ${cause}`))),
    Effect.catchAll(() => Effect.sync(() => process.exit(1))),
    BunRuntime.runMain,
  );
}
