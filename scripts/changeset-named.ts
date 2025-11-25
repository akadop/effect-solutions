#!/usr/bin/env bun
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const PACKAGES = {
  website: "@effect-best-practices/website",
  cli: "effect-solutions",
} as const;

const description = process.argv[2];
const packageArg = (process.argv[3] || "website") as keyof typeof PACKAGES;
const bump = process.argv[4] || "patch";

if (!description) {
  console.error("Usage: bun scripts/changeset-named.ts <description> [website|cli] [patch|minor|major]");
  console.error("Defaults: website, patch");
  process.exit(1);
}

if (!(packageArg in PACKAGES)) {
  console.error(`Invalid package: ${packageArg}. Use: website or cli`);
  process.exit(1);
}

if (!["patch", "minor", "major"].includes(bump)) {
  console.error(`Invalid bump: ${bump}. Use: patch, minor, or major`);
  process.exit(1);
}

const packageName = PACKAGES[packageArg];
const kebabName = description.replace(/\s+/g, "-").toLowerCase();
const fileName = `${kebabName}.md`;
const filePath = join(".changeset", fileName);

const content = `---
"${packageName}": ${bump}
---

${description}
`;

await writeFile(filePath, content);
console.log(`✅ Created changeset: ${fileName}`);
