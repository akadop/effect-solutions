# effect-solutions

## 0.3.2

### Patch Changes

- [`321726e`](https://github.com/kitlangton/effect-solutions/commit/321726e26d8875fe1ed35389dddaec74f4bdfa9b) Thanks [@kitlangton](https://github.com/kitlangton)! - Add repository field to packages for npm provenance. Fix semver comparison in update notifier to prevent showing false update notifications when current version is newer than published version.

## 0.3.1

### Patch Changes

- [`622f4dc`](https://github.com/kitlangton/effect-solutions/commit/622f4dcfb6e893b4ea0364d13bbbea1b322077a3) Thanks [@kitlangton](https://github.com/kitlangton)! - Stop `tsc --build` from emitting dist test artifacts so `bun test` only runs source tests; also tidy CLI open-issue logging and update notifier typings.

- [`479dc5e`](https://github.com/kitlangton/effect-solutions/commit/479dc5eb5c459aaf0a6f99f0a29ef93cdd72db9c) Thanks [@kitlangton](https://github.com/kitlangton)! - Improve release workflow with OIDC trusted publishing and automatic GitHub releases

## 0.3.0

### Minor Changes

- [`0235cf2`](https://github.com/kitlangton/effect-solutions/commit/0235cf2e51024ac205a5a6d70b405dcefdd524aa) Thanks [@kitlangton](https://github.com/kitlangton)! - Comprehensive feature updates across all packages

  **Website**

  - Add OG image generation via Playwright for social sharing
  - Refactor LLM instructions to shared lib
  - Add route groups for better Next.js organization
  - Update docs content

  **CLI**

  - Add update notifier with daily version checks
  - Add open-issue command for GitHub issue creation
  - Support multiple browser opening strategies

  **MCP Server**

  - Add comprehensive test suite for all tools
  - Refactor for improved testability
  - Add vitest dependency

### Patch Changes

- ## [`f034319`](https://github.com/kitlangton/effect-solutions/commit/f03431945dd92af198a874e0ae50e71a014b8095) Thanks [@kitlangton](https://github.com/kitlangton)! - Add multi-arch CLI binaries, launch wrapper, and tag-driven release CI to fix x86/Intel install failures.

## 0.2.4

### Patch Changes

- aa6efbd: Add new documentation topics (HTTP clients, testing with Vitest, observability), publish MCP server, and improve UI animations. All bunx commands now use @latest suffix for consistency.

## 0.2.3

### Patch Changes

- - Read version from package.json instead of hardcoding
  - Fix MCP resource URI pattern to match docs/\* scheme

## 0.2.2

### Patch Changes

- Fix hardcoded version string in CLI

## 0.2.1

### Patch Changes

- Initial release with documentation CLI and MCP server
