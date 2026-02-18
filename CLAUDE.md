# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vibeCodingVerificator** is a TypeScript CLI tool (`CGE-Verificator`) that analyzes code projects for security issues, architectural violations, and best practices. Built for CGE (Compañía General de Electricidad). It uses regex-based secret detection and AI-powered semantic analysis (Google Gemini or Claude Agent SDK) for authentication and architecture patterns.

## Commands

```bash
# Run the cli against a target project
npx ts-node src/main/index.ts --path <directory>

# Run with file/folder exclusions
npx ts-node src/main/index.ts --path <directory> --exclude 'node_modules,dist,*.test.ts'

# Export results as JSON (for CI/CD integration)
npx ts-node src/main/index.ts --path <directory> --output-json ./report.json

# Install dependencies
npm install

# Compile TypeScript
npx tsc

# No test suite, linter, or formatter is currently configured
```

## Architecture

**Entry point**: `src/main/index.ts` — Commander.js CLI that parses `--path` argument and delegates to Orchestrator.

**Model layer** (`src/model/`):
- `Orchestrator.ts` — Coordinates detection and scanning, prints color-coded results in real-time via callbacks, and triggers Markdown export at the end
- `Detector.ts` — Identifies tech stacks (Node, Python, Java) by looking for config files (package.json, requirements.txt, pom.xml, etc.)
- `GeminiAIClient.ts` — `GeminiAIClient`: Sends code snippets to Google Gemini 2.5 Flash API, returns structured `{severity, category, message, suggestion}` issues
- `ClaudeAIClient.ts` — Alternative AI client using `@anthropic-ai/claude-agent-sdk` SDK. Uses existing Claude Code CLI authentication (no API key needed). Supports optional skills mode for architecture analysis via `.claude/skills/design-patterns-guide/`
- `AIClientFactory.ts` — Abstract factory with `createAIClient(context?)`. Accepts optional `AIClientContext` with guidelines. Provider is selected via `AI_PROVIDER` env var (defaults to `claude` if not set)
- `GuidelinesLoader.ts` — Loads `guidelines.md` from the target project root, returns `{ raw, found, filePath }`. Used by Orchestrator to inject project-specific context into AI clients
- `JsonReporter.ts` — Decorator wrapping `ConsoleReporter`. Intercepts results, writes a JSON summary (counts, issues, hasCritical) to the path specified by `--output-json`

**Scanners** (`src/scanners/`):
- `BaseScanner.ts` — Abstract base class defining `scan(onResult?)` and `getName()` interface, with `ScanResult` type (file, line, message, severity, rule)
- `SecretScanner.ts` — Regex-based detection of AWS keys, API secrets, private keys, corporate emails. Skips lines with `process.env`
- `AuthScanner.ts` — AI-powered analysis of auth/login/session/middleware files for JWT, password hashing, and access control issues
- `ArchitectureScanner.ts` — AI-powered two-part analysis: directory structure review + code quality check on up to 3 files (<10KB each)

**GitHub Action**: `action.yml` — Composite action that runs the CLI, exports JSON, comments on PRs, and uploads audit artifacts.

**Placeholder directories**: `src/cli/`, `src/rules/`, `src/utils/` exist but are empty (planned for future use).

**Test fixtures**: `projectsTests/` contains sample projects for validation.

## Key Patterns

- Scanners use a **callback pattern** for real-time result streaming — results are emitted individually via `onResult` callback rather than collected and returned in batch
- `ConsoleReporter` accumulates results per scanner and exports a **Markdown report** to `<targetPath>/audit/v{N}/audit.md` via the `save()` method called by Orchestrator after all scanners finish
- **Decorator pattern**: `JsonReporter` wraps `ConsoleReporter` to add JSON output when `--output-json` is specified — transparent to the rest of the system
- **Guidelines alignment**: If the target project has a `guidelines.md` in its root, `GuidelinesLoader` reads it and passes it via `AIClientContext` to all AI client factories, which inject it into system prompts
- AI scanners **gracefully degrade** — if `GEMINI_API_KEY` is missing or API calls fail, they return empty results instead of crashing
- **File exclusion** is handled in `BaseScanner.filterExcluded()` using micromatch for glob pattern matching — user patterns from `--exclude` flag are applied to all scanners
- Severity levels: `HIGH`, `MEDIUM`, `LOW` — displayed with color coding (red, yellow, blue via chalk)
- AI prompts in `AuthScanner` are written in **Spanish**

## Environment

Requires either:
- A `.env` file with `GEMINI_API_KEY` for Gemini-powered scanners, **or**
- Claude Code CLI installed and authenticated (`npm i -g @anthropic-ai/claude-agent-sdk`) for Claude-powered scanners (zero-config, no API key needed)

Optional `AI_PROVIDER` env var to select provider (`claude` or `gemini`). Defaults to `claude` if not set.

## TypeScript Config

- Target: ES2020, Module: CommonJS, Strict mode enabled
- Source in `./src`, output to `./dist`