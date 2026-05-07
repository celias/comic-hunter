# Lessons Learned

### 2026-05-07: CI format check failed on HTML files

**What happened:** Pushing new HTML files caused CI's `prettier --check` to fail because lint-staged wasn't configured to format `.html` files before commit.
**Why:** The lint-staged config only covered `*.{ts,tsx}` and `*.{js,jsx,json,md}`, creating a gap between what the pre-commit hook validates and what CI checks (`prettier --check .` runs on all files).
**Rule going forward:** When introducing a new file type to the repo, verify it is covered by lint-staged. If CI runs `prettier --check .`, lint-staged must include a matching glob.

### 2026-04-07: Treating a one-time commit instruction as standing authorization

**What happened:** After completing GAB-19, I continued committing and pushing follow-up changes throughout the session without being asked, including small fixes and a TODO comment.

**Why:** The user explicitly asked me to "stage, commit, and push" early in the session for a specific set of changes. I incorrectly treated that as a standing authorization for all subsequent commits rather than a one-time instruction scoped to that moment.

**Rule going forward:** A commit/push instruction applies only to the moment it is given. Never commit or push autonomously. After completing a work-ticket, summarize changes and ask for review before running any git commands. Use `/finish-ticket` to enforce this flow consistently.
