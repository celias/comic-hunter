Pull up ticket $ARGUMENTS from Linear using get_issue.

1. Read the ticket fully — acceptance criteria, implementation plan, testing plan, and any comments.

**Before doing any work, check if it's already done:** 2. Search the codebase for evidence the work described in the ticket already exists (grep for key identifiers, function names, routes, or UI elements mentioned in the acceptance criteria). 3. Check git log on main for recent commits that may have addressed this work. 4. If the work appears already complete, tell me what you found and ask whether to close the ticket as-is or continue.

**If work is not already done:** 5. Use list_issue_statuses to find the correct "Done" or "Complete" status ID for this team. 6. Implement everything described in the ticket. Reference specific files and follow the implementation plan order. 7. Run any relevant tests and verify acceptance criteria are met. 8. Show me a summary of what was done and ask for confirmation before closing. 9. On confirmation, use save_issue to move the ticket to the "Done" status. 10. Use save_comment to add a brief summary of what was implemented and any notable decisions made.
