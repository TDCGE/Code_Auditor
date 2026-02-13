# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vibeCodingVerificator** is a TypeScript CLI tool (`CGE-Verificator`) that analyzes code projects for security issues, architectural violations, and best practices. Built for CGE (Compañía General de Electricidad). It uses regex-based secret detection and Google Gemini AI for semantic analysis of authentication and architecture patterns.

## Commands

```bash
# Run the tool against a target project
npx ts-node src/index.ts --path <directory>

# Install dependencies
npm install

# Compile TypeScript
npx tsc

# No test suite, linter, or formatter is currently configured
```

## Architecture

**Entry point**: `src/index.ts` — Commander.js CLI that parses `--path` argument and delegates to Orchestrator.

**Core layer** (`src/core/`):
- `Orchestrator.ts` — Coordinates detection and scanning, prints color-coded results in real-time via callbacks
- `Detector.ts` — Identifies tech stacks (Node, Python, Java) by looking for config files (package.json, requirements.txt, pom.xml, etc.)
- `AIClient.ts` — Sends code snippets to Google Gemini 2.5 Flash API, returns structured `{severity, category, message, suggestion}` issues

**Scanners** (`src/scanners/`):
- `BaseScanner.ts` — Abstract base class defining `scan(onResult?)` and `getName()` interface, with `ScanResult` type (file, line, message, severity, rule)
- `SecretScanner.ts` — Regex-based detection of AWS keys, API secrets, private keys, corporate emails. Skips lines with `process.env`
- `AuthScanner.ts` — AI-powered analysis of auth/login/session/middleware files for JWT, password hashing, and access control issues
- `ArchitectureScanner.ts` — AI-powered two-part analysis: directory structure review + code quality check on up to 3 files (<10KB each)

**Placeholder directories**: `src/cli/`, `src/rules/`, `src/utils/` exist but are empty (planned for future use).

**Test fixtures**: `projectsTests/` contains sample projects for validation. `vulnerable_code.js` and `src/middleware/auth.js` are intentionally vulnerable test files.

## Key Patterns

- Scanners use a **callback pattern** for real-time result streaming — results are emitted individually via `onResult` callback rather than collected and returned in batch
- AI scanners **gracefully degrade** — if `GEMINI_API_KEY` is missing or API calls fail, they return empty results instead of crashing
- Severity levels: `HIGH`, `MEDIUM`, `LOW` — displayed with color coding (red, yellow, blue via chalk)
- AI prompts in `AuthScanner` are written in **Spanish**

## Environment

Requires a `.env` file with `GEMINI_API_KEY` for AI-powered scanners (see `.env.example`).

## TypeScript Config

- Target: ES2020, Module: CommonJS, Strict mode enabled
- Source in `./src`, output to `./dist`