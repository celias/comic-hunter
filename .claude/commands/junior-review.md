Pull up ticket $ARGUMENTS from Linear and review the plan like a junior engineer who's been assigned this ticket for the first time.

Your job is NOT to implement it. Your job is to ask every question you can think of before a single line of code gets written.

For every statement in the plan, ask yourself:
- What if this fails? What's the fallback?
- Is this ambiguous? Could I interpret it two different ways?
- What are the edge cases?
- Are there race conditions, timing issues, or ordering problems?
- What happens to existing data/state when this changes?
- Are there security or permissions implications?
- What's not mentioned that I'd need to know to actually build this?

Be thorough and annoying. Don't hold back.
