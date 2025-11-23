# @effect-best-practices/website

## 0.4.2

### Patch Changes

- [`b734ce1`](https://github.com/kitlangton/effect-solutions/commit/b734ce194e262a04931c5f9e674c913f79652a90) Thanks [@kitlangton](https://github.com/kitlangton)! - Add MIT license and contributing guidelines with issue-first workflow

- Improve agent setup instructions: restructure LLM instructions with consolidated confirmation rules and interaction modes, refine quick-start documentation with clearer agent-guided setup framing, and simplify reference repositories guidance

- [`b734ce1`](https://github.com/kitlangton/effect-solutions/commit/b734ce194e262a04931c5f9e674c913f79652a90) Thanks [@kitlangton](https://github.com/kitlangton)! - Standardize code style across documentation examples: remove semicolons, use destructured imports from 'effect', enforce camelCase layer naming, and consistent @app/ tag prefixes

## 0.4.1

### Patch Changes

- [`6a6f9ec`](https://github.com/kitlangton/effect-solutions/commit/6a6f9ecc471f25c3a9cc6c253b0dc1c4d16d7de0) Thanks [@kitlangton](https://github.com/kitlangton)! - Fix AudioContext errors and sound queueing issues. Sounds now wait for first user interaction (click/keydown/touch) before playing, preventing console warnings and simultaneous playback of queued sounds. Also fixed negative blur filter values in animations.

## 0.4.0

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

## 0.3.0

### Minor Changes

- 243af14: Remove interactive lesson components and simplify site navigation. Add CursorInstallButton for one-click MCP setup. Update design documentation with hard-edge styling guidelines.

### Patch Changes

- f9f85b3: Add mock layer implementation patterns to services documentation
- 85cb49a: Improve LLM instructions UX and add GitHub link

  - Restructure overview with "LLM Agent Quick Start" section
  - Add GitHub link to header next to sound toggle
  - Fix text overflow glitch in LLMInstructionsButton animation

## 0.2.0

### Minor Changes

- Add LLM Instructions button to overview page

  New LLMInstructionsButton component provides:

  - One-click copy of AI assistant setup instructions
  - Guidance on MCP setup, project setup, and Effect questions
  - Links to MCP server commands and CLI access
  - Complete list of key topics covered in documentation

  Helps users quickly share Effect Solutions context with AI assistants for better Effect development support.
