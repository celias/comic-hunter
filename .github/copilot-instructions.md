# Comic Hunter Project Instructions

This project integrates with external APIs that have strict rate limits and authentication requirements.

## Comic Vine API Guidelines

**Always consider rate limits:**

- Comic Vine API: 200 requests/hour (3.3 requests/minute)
- Use minimum 20-second delays between requests
- Implement exponential backoff for retries
- Include request counting and progress logging

**Required patterns:**

- Store API keys in environment variables (never hardcode)
- Use proper User-Agent headers for API requests
- Implement comprehensive error handling for API failures
- Add timeout handling for slow responses
- Log all API interactions for debugging

**When suggesting Comic Vine API code:**

- Always include rate limiting delays
- Use the project's existing patterns from extract-comic-vine-keywords.js
- Handle pagination properly with offset/limit parameters
- Validate API responses before processing data

Refer complex Comic Vine API questions to the @comic-vine-api specialist agent.
