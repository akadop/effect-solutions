#!/usr/bin/env bun

import { DOC_LOOKUP, DOCS } from "../../cli/src/docs-manifest";
import { McpSchema, McpServer, Tool, Toolkit } from "@effect/ai";
import { BunRuntime, BunSink, BunStream } from "@effect/platform-bun";
import { Effect, Layer, Schema } from "effect";

const SERVER_NAME = "effect-solutions";
const SERVER_VERSION = "0.1.0";
const DOC_URI_PREFIX = "effect-docs://";

const docCompletionValues = DOCS.map((doc) => doc.slug);

const lookupDocMarkdown = (slug: string) =>
  Effect.try(() => {
    const doc = DOC_LOOKUP[slug];
    if (!doc) {
      throw new Error(`Unknown doc slug: ${slug}`);
    }
    return `# ${doc.title} (${doc.slug})\n\n${doc.body}`.trimEnd();
  });

const listMarkdown = [
  "# Effect Solutions Documentation Index",
  "",
  ...DOCS.map((doc) => `- **${doc.slug}** — ${doc.title}: ${doc.description}`),
].join("\n");

const docSlugParam = McpSchema.param("slug", Schema.String);

const DocsIndexResource = McpServer.resource({
  uri: "effect-docs://docs/topics",
  name: "Effect Solutions Topics",
  description: "Markdown index of all Effect Solutions documentation slugs.",
  mimeType: "text/markdown",
  content: Effect.succeed(listMarkdown),
});

const DocsTemplate = McpServer.resource`effect-docs://${docSlugParam}`({
  name: "Effect Solutions Doc",
  description:
    "Fetch any Effect Solutions doc by slug (see completions for available slugs).",
  mimeType: "text/markdown",
  completion: {
    slug: () => Effect.succeed(docCompletionValues),
  },
  content: (_uri, slug: string) => lookupDocMarkdown(slug),
});

// Search tool implementation
const SearchTool = Tool.make("search_effect_solutions", {
  description: "Search Effect Solutions documentation by query string. Returns matching docs with relevance scoring.",
  parameters: {
    query: Schema.String.annotations({
      description: "Search query to find relevant Effect documentation topics",
    }),
  },
  success: Schema.Struct({
    results: Schema.Array(
      Schema.Struct({
        slug: Schema.String.annotations({
          description: "Unique identifier for the documentation topic",
        }),
        title: Schema.String.annotations({
          description: "Title of the documentation topic",
        }),
        description: Schema.String.annotations({
          description: "Brief description of what the topic covers",
        }),
        excerpt: Schema.String.annotations({
          description: "Text excerpt containing the search query",
        }),
        score: Schema.Number.annotations({
          description: "Relevance score (higher is more relevant)",
        }),
      })
    ).annotations({
      description: "List of matching documentation topics, sorted by relevance",
    }),
  }),
});

// Open GitHub issue tool
const OpenIssueTool = Tool.make("open_issue", {
  description: "Open a GitHub issue to request new documentation, ask questions not covered by current guides, or suggest topics. Returns a pre-filled issue URL.",
  parameters: {
    title: Schema.String.annotations({
      description: "Brief title for the issue (e.g., 'How to handle errors in services')",
    }),
    description: Schema.String.annotations({
      description: "Detailed description of the topic, question, or documentation request",
    }),
  },
  success: Schema.Struct({
    issueUrl: Schema.String.annotations({
      description: "GitHub issue URL with pre-filled content",
    }),
    message: Schema.String,
  }),
});

const searchDocs = ({ query }: { query: string }) =>
  Effect.sync(() => {
    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(/\s+/);

    // Score each doc based on query match
    const results = DOCS.map((doc) => {
      const titleLower = doc.title.toLowerCase();
      const descLower = doc.description.toLowerCase();
      const bodyLower = doc.body.toLowerCase();
      const slugLower = doc.slug.toLowerCase();

      let score = 0;

      // Exact phrase match (highest priority)
      if (titleLower.includes(normalizedQuery)) score += 100;
      if (descLower.includes(normalizedQuery)) score += 50;
      if (slugLower.includes(normalizedQuery)) score += 75;
      if (bodyLower.includes(normalizedQuery)) score += 25;

      // Individual term matches
      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        if (descLower.includes(term)) score += 5;
        if (slugLower.includes(term)) score += 7;
        if (bodyLower.includes(term)) score += 2;
      }

      // Find excerpt containing query
      const excerptLength = 200;
      let excerpt = doc.description;
      const queryIndex = bodyLower.indexOf(normalizedQuery);
      if (queryIndex !== -1) {
        const start = Math.max(0, queryIndex - 50);
        const end = Math.min(doc.body.length, queryIndex + excerptLength);
        excerpt = (start > 0 ? "..." : "") +
                  doc.body.slice(start, end) +
                  (end < doc.body.length ? "..." : "");
      }

      return {
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        excerpt: excerpt.trim(),
        score,
      };
    })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score);

    return { results };
  });

const openIssue = ({ title, description }: { title: string; description: string }) =>
  Effect.sync(() => {
    const repoUrl = "https://github.com/kitlangton/effect-solutions";
    const body = `## Description\n\n${description}\n\n---\n*Created via Effect Solutions MCP*`;

    const issueUrl = `${repoUrl}/issues/new?${new URLSearchParams({
      title,
      body,
    }).toString()}`;

    return {
      issueUrl,
      message: `GitHub issue URL created. Open this URL to submit: ${issueUrl}`,
    };
  });

const toolkit = Toolkit.make(SearchTool, OpenIssueTool);

const toolkitLayer = toolkit.toLayer({
  search_effect_solutions: searchDocs,
  open_issue: openIssue,
});

const serverLayer = Layer.mergeAll(
  DocsIndexResource,
  DocsTemplate,
  Layer.effectDiscard(McpServer.registerToolkit(toolkit)),
).pipe(
  Layer.provideMerge(toolkitLayer),
  Layer.provide(
    McpServer.layerStdio({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      stdin: BunStream.stdin,
      stdout: BunSink.stdout,
    }),
  ),
);

Layer.launch(serverLayer).pipe(BunRuntime.runMain);
