You are doing a targeted technical debt audit of this codebase. The goal is to find problems that were baked in before structured agent workflows, Linear tickets, and enforced conventions existed — specifically in the early commits before any GAB-\* ticket references appear.

Run `git log --oneline --reverse` to identify the pre-agent era (commits before GAB-\* tickets and .claude/ tooling). Then audit the current codebase for debt that likely originates from that period.

Check for each of the following:

**Structure & Ownership**

- Are there files or directories that don't belong anywhere obvious, or that duplicate logic that now lives in `lib/`?
- Is there dead code: exported functions, variables, types, or modules that are never imported anywhere?
- Are there stale modules from earlier architectures (SQLite era, pre-Prisma, pre-Turborepo)?
- Are there any `.js` source files that should be `.ts`?

**Dead Code & Bad Practices**

- Are there commented-out blocks of code that were never removed?
- Are there `console.log` / `console.error` calls that bypass the shared `log()` utility from `lib/logger.ts`?
- Are there TODO or FIXME comments that represent real unfinished work?
- Are there functions that are defined but never called, or imports that are never used?
- Are there magic numbers or magic strings that have no name or explanation?
- Are there copy-paste patterns — blocks of logic that appear two or more times and should be extracted?

**Type Safety**

- Are there uses of `any`, non-null assertions (`!`), or type casts (`as SomeType`) that paper over real unknowns?
- Are function signatures loose where they could be strict?
- Are API response shapes typed, or are they assumed?

**Error Handling**

- Are there unhandled promise rejections, bare `catch` blocks that swallow errors, or silent failures?
- Does the Reddit poller handle rate limits, auth failures, and network timeouts — or does it crash and stay down?
- Does the Discord webhook have retry logic, or does a failure mean a missed alert?

**Data Model**

- Does the Prisma schema reflect the actual usage, or are there fields that are never read or always null?
- Is there any place where data is stored as a raw JSON blob because a real schema wasn't designed?

**Configuration**

- Are there hardcoded values that should be in `lib/config.ts` or env vars?
- Are there any secrets or environment assumptions embedded in source files?

**Observability**

- Does the poller surface meaningful errors, or do failures disappear into the void?
- Is there any way to tell if the poller has stopped working without manually checking?

**Dashboard / API contract**

- Does the API actually reflect what the dashboard needs, or are there fields the dashboard ignores or that the API doesn't provide?
- Is pagination handled, or does the API return everything forever?

**Documentation & READMEs**

- List every README and doc file in the repo. For each one, check whether it accurately reflects the current codebase — architecture, commands, file names, stack, and workflow.
- Flag anything that describes a removed feature (SQLite, old file structure, pre-Turborepo setup), uses outdated commands, or contradicts CLAUDE.md.
- Note any sections that are missing entirely — things the project now does that no doc mentions.
- The user wants to do a full README overhaul: identify which docs should be rewritten from scratch vs. lightly updated, and which should be deleted.

After your audit, produce a ranked list of findings. For each one:

- **Where:** file and line if applicable
- **What:** the specific problem
- **Why it matters:** what breaks or degrades if it's never fixed
- **Suggested fix:** one concrete sentence

Flag the top 3 as "fix these first." Be direct and do not soften findings.
