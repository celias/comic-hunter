Review the changes made during this work session, prompt the user to confirm, then commit and push.

1. Run `git diff --stat HEAD` and `git status` to summarize what changed
2. Present a brief plain-English summary of the changes to the user
3. Ask: "Ready to commit and push? If so, give me a ticket ID (e.g. GAB-19) to reference in the commit message, or say 'go' to use a generic message."
4. Wait for confirmation before doing anything
5. Once confirmed:
   - Stage all relevant changes with `git add`
   - Commit with a message following the repo's conventional commit style, referencing the ticket ID if provided
   - Push to `origin main`
6. Report the commit hash and confirm the push succeeded
