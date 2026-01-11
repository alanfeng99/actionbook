# Contributing to Actionbook

Thank you for your interest in contributing to Actionbook! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Commit Message Convention](#commit-message-convention)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Community Guidelines](#community-guidelines)

## Ways to Contribute

There are many ways to contribute to Actionbook:

- 🐛 **Report Bugs** - Use our [bug report template](https://github.com/actionbook/actionbook/issues/new?template=bug-report.yml)
- 💡 **Propose Features** - Use our [feature request template](https://github.com/actionbook/actionbook/issues/new?template=feature-request.yml)
- 📝 **Improve Documentation** - Help us improve docs, README files, or code comments
- 🔧 **Submit Code** - Fix bugs, implement features, or improve performance
- 🌐 **Request Website Support** - Suggest new websites to add action manuals for
- ❓ **Ask Questions** - Use our [question template](https://github.com/actionbook/actionbook/issues/new?template=question.yml)

## Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ (LTS recommended)
- **pnpm** 10+
- **PostgreSQL** (or access to a PostgreSQL database like Neon/Supabase)
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/actionbook.git
cd actionbook
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/actionbook/actionbook.git
```

### Install Dependencies

```bash
pnpm install
```

### Environment Setup

Each package has its own `.env.example` file. Copy and configure them:

```bash
# Database service
cp services/db/.env.example services/db/.env

# Action builder service
cp services/action-builder/.env.example services/action-builder/.env

# API service
cp apps/api-service/.env.example apps/api-service/.env

# Edit each .env file with your credentials
```

**Key environment variables:**

| Service                      | Required Variables                                       |
| ---------------------------- | -------------------------------------------------------- |
| `services/db`                | `DATABASE_URL`                                           |
| `services/action-builder`    | `DATABASE_URL`, `OPENROUTER_API_KEY`, Stagehand configs  |
| `services/knowledge-builder` | `DATABASE_URL`, `OPENAI_API_KEY`                         |
| `apps/api-service`           | `DATABASE_URL`, `OPENAI_API_KEY`                         |

### Database Setup

1. Start local PostgreSQL (or use remote database):

```bash
docker-compose up -d postgres
```

2. Run migrations:

```bash
cd services/db
pnpm migrate
```

3. (Optional) Open Drizzle Studio to inspect database:

```bash
pnpm studio
```

### Start Development

```bash
# Start all services in development mode
pnpm dev

# Or start specific services
pnpm dev --filter=@actionbookdev/api-service --filter=actionbook-home
```

## Project Structure

Actionbook is a **monorepo** managed with **pnpm workspaces** and **Turborepo**.

```
actionbook/
├── packages/          # Publishable npm packages
│   ├── js-sdk/       # @actionbookdev/sdk - Core SDK with types
│   ├── mcp/          # @actionbookdev/mcp - MCP Server
│   └── tools-ai-sdk/ # AI SDK tools integration
├── apps/             # Applications
│   ├── website/      # Next.js 16 landing page
│   ├── api-service/  # REST API (Vercel deployment)
│   ├── api-server/   # API server
│   └── docs/         # Product documentation
├── services/         # Internal services (not published)
│   ├── db/           # @actionbookdev/db - Database schema + types
│   ├── action-builder/       # Action recording, validation, Eval
│   ├── knowledge-builder/    # Scenario extraction, Eval
│   └── common/               # Shared utilities
├── playground/       # Demo and example projects
└── old_projects/     # Legacy/archived projects
```

### Package Categories

- **`packages/`** - Published to npm registry (`@actionbookdev/*`)
- **`apps/`** - Deployed applications (Vercel, etc.)
- **`services/`** - Internal workspace packages (not published)
- **`playground/`** - Examples and demos

## Commit Message Convention

⚠️ **IMPORTANT**: This is a monorepo. All commit messages **MUST** follow this format:

```
[scope]type: description

[optional body]

[optional footer]
```

### Format Rules

- **`[scope]`**: The workspace/package path in square brackets, or `[root]` for root-level files
  - Workspace examples: `[packages/js-sdk]`, `[apps/api-service]`, `[services/db]`
  - Root-level: `[root]` (for files like README.md, CONTRIBUTING.md, package.json, etc.)
- **`type`**: Conventional commit type
  - `feat` - New feature
  - `fix` - Bug fix
  - `docs` - Documentation changes
  - `refactor` - Code refactoring
  - `test` - Adding/updating tests
  - `chore` - Maintenance tasks
  - `perf` - Performance improvements
  - `style` - Code style changes (formatting, etc.)
- **`description`**: Brief description of the change (lowercase, no period at end)

### Examples

```bash
# Package changes
[packages/js-sdk]feat: add new search parameter to search_actions tool
[packages/mcp]fix: correct ESM export path in package.json
[services/db]feat: add indexes to improve query performance

# App changes
[apps/website]fix: correct API endpoint URL in contact form
[apps/api-service]refactor: migrate to new database client

# Root-level changes
[root]docs: add CONTRIBUTING.md with development guidelines
[root]chore: update pnpm-workspace.yaml
[root]chore: upgrade to pnpm 10

# Multi-package changes - use the primary affected package
[packages/js-sdk]refactor: align types with database schema
```

### Why This Matters

- Makes it easy to see which part of the monorepo changed
- Enables automated changelog generation per package
- Helps with selective builds and deployments
- Improves code review efficiency

## Coding Standards

### TypeScript

- Use **TypeScript strict mode** (`"strict": true`)
- Prefer explicit types over `any`
- Use type inference where appropriate
- Document complex types with comments

### Data Validation

- Use **Zod** for runtime validation and schema definition
- Define schemas close to where they're used
- Export schemas for reuse

```typescript
import { z } from 'zod'

export const ActionIdSchema = z.string().regex(/^site\/[^/]+\/page\/[^/]+\/element\/[^/]+$/)
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `action-builder.ts`)
- **Components**: `PascalCase.tsx` (e.g., `ActionCard.tsx`)
- **Functions**: `camelCase` (e.g., `searchActions`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Types/Interfaces**: `PascalCase` (e.g., `ActionMeta`, `SearchParams`)

### File Organization

- **Development documentation**: Place in `.docs/` directory
- **Product documentation**: Place in `apps/docs/`
- **Test files**: Co-locate with source files as `*.test.ts` or `*.spec.ts`

### Code Style

- Use **ESLint** and **Prettier** (configs provided in repository)
- Run linter before committing: `pnpm lint`
- Format code: `pnpm format` (if available)

## Pull Request Process

### Before Submitting

1. ✅ Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. ✅ Follow the [commit message convention](#commit-message-convention)

3. ✅ Ensure all tests pass:
   ```bash
   pnpm test
   ```

4. ✅ Check linting:
   ```bash
   pnpm lint
   ```

5. ✅ Build successfully:
   ```bash
   pnpm build
   ```

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template with:
   - Clear description of changes
   - Related issue numbers (e.g., "Closes #123")
   - Screenshots (for UI changes)
   - Testing instructions

4. Wait for code review and address feedback

### PR Requirements

- ✅ All tests pass
- ✅ Code coverage ≥ 50% for new code
- ✅ No linting errors
- ✅ Clear commit messages following convention
- ✅ Updated documentation (if applicable)
- ✅ Approved by at least one maintainer

## Testing Guidelines

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@actionbookdev/sdk

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Use the testing framework configured in each package (usually Vitest or Jest)
- Aim for **50% minimum code coverage** for new code
- Test critical paths and edge cases
- Mock external dependencies (database, APIs, browser automation)

### Test Structure

```typescript
import { describe, it, expect } from 'vitest'

describe('searchActions', () => {
  it('should return actions matching keyword', async () => {
    const result = await searchActions({ keyword: 'login' })
    expect(result).toHaveLength(3)
  })

  it('should handle empty results', async () => {
    const result = await searchActions({ keyword: 'nonexistent' })
    expect(result).toHaveLength(0)
  })
})
```

### Testing Tools

- **Vitest** - Fast unit testing
- **Playwright** - Browser automation testing
- **Zod** - Schema validation testing

## Community Guidelines

### Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for all contributors.

### Communication

- 💬 **GitHub Issues** - Bug reports, feature requests, questions
- 🐦 **X (Twitter)** - Follow [@actionbookdev](https://x.com/actionbookdev) for updates
- 💼 **Discord** - Join our community (link coming soon)

### Getting Help

- Check existing [Issues](https://github.com/actionbook/actionbook/issues)
- Read the [documentation](https://actionbook.dev/docs)
- Ask questions using the [question template](https://github.com/actionbook/actionbook/issues/new?template=question.yml)
- Review [CLAUDE.md](CLAUDE.md) for project overview

### Recognition

We value all contributions! Contributors will be:
- Listed in our README.md contributors section
- Mentioned in release notes for significant contributions
- Given credit in documentation they author

---

## Quick Reference

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Testing
pnpm test
pnpm test --filter=@actionbookdev/sdk

# Building
pnpm build
pnpm build --filter=@actionbookdev/mcp...

# Linting
pnpm lint

# Database
cd services/db
pnpm migrate
pnpm studio
```

---

Thank you for contributing to Actionbook! 🚀

If you have questions or need help, please don't hesitate to reach out through GitHub Issues.
