#!/usr/bin/env bun

import { readdir } from "node:fs/promises"
import { $ } from "bun"

// Release script that handles everything:
// 1. Generate OG images
// 2. Generate CLI manifest
// 3. Commit any uncommitted changes
// 4. Run changeset version + tag
// 5. Push with tags

async function hasChangesets(): Promise<boolean> {
  const files = await readdir(".changeset")
  return files.some((f) => f.endsWith(".md") && f !== "README.md")
}

async function run() {
  // Check for changesets first
  if (!(await hasChangesets())) {
    console.log("⚠️  No changesets found. Create one with:")
    console.log('   bun scripts/changeset-named.ts "description"')
    process.exit(1)
  }

  console.log("📸 Generating OG images...")
  await $`bun ./scripts/generate-og.ts`.cwd("packages/website")

  console.log("\n📦 Generating CLI manifest...")
  await $`bun ./scripts/generate-manifest.ts`.cwd("packages/cli")

  // Check for uncommitted changes
  const status = await $`git status --porcelain`.text()
  if (status.trim()) {
    console.log("\n📝 Committing generated files...")
    await $`git add -A`
    await $`git commit -m "Generate OG images and manifest"`
  }

  console.log("\n🔖 Running changeset version...")
  const token = await $`gh auth token`.text()
  await $`GITHUB_TOKEN=${token.trim()} bunx changeset version`

  console.log("\n🏷️  Creating tags...")
  await $`bunx changeset tag`

  console.log("\n🚀 Pushing with tags...")
  await $`git push --follow-tags`

  console.log("\n✅ Release complete!")
}

run().catch((err) => {
  console.error("❌ Release failed:", err.message)
  process.exit(1)
})
