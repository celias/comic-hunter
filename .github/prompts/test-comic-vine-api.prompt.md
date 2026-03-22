---
description: "Test Comic Vine API endpoints with proper rate limiting and error handling"
argument-hint: "Specify endpoint (characters/volumes/publishers/search) and optional query"
---

# Test Comic Vine API Endpoint

Create a quick test script to verify Comic Vine API connectivity and response format.

**Specify your requirements:**

- **Endpoint:** Which Comic Vine endpoint? (characters, volumes, publishers, search, etc.)
- **Query:** Any search query or filter parameters? (optional)
- **Limit:** Number of results to fetch? (default: 10)

## Requirements

**Generate a test script that:**

1. Uses the project's existing API patterns from [extract-comic-vine-keywords.js](../../extract-comic-vine-keywords.js)
2. Includes proper rate limiting (20-second delays)
3. Handles authentication with environment variables
4. Implements comprehensive error handling
5. Logs request/response details for debugging
6. Limits results for quick testing

**Test Configuration:**

- Rate limiting: 20 seconds between requests
- Output: JSON response structure and key fields
- Error handling: Network failures, API errors, authentication issues

**Expected Output:**

- Connection status (success/failure)
- Raw API response sample
- Parsed key fields (name, id, description, etc.)
- Rate limit compliance confirmation
- Any error messages or debugging info

Save the test script with a descriptive name and provide usage instructions.
