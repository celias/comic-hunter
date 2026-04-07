---
description: "Apply Comic Vine API patterns and rate limiting to API-related files"
applyTo: "**/*{api,vine,comic}*.{js,ts,mjs}"
---

# API Files Instructions

When working with files that interact with external APIs (especially Comic Vine):

## Required Patterns

**Rate Limiting:**

```javascript
const RATE_LIMIT_MS = 20000; // 20 seconds between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Always use:
await sleep(RATE_LIMIT_MS);
```

**Error Handling:**

```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }
  const data = await response.json();
  if (data.error !== "OK") {
    throw new Error(`Comic Vine error: ${data.error}`);
  }
} catch (error) {
  console.error(`API Error: ${error.message}`);
  // Implement retry logic or graceful fallback
}
```

**Request Structure:**

```javascript
const url = new URL(`${BASE_URL}/${endpoint}/`);
url.searchParams.set("api_key", API_KEY);
url.searchParams.set("format", "json");
url.searchParams.set("limit", "100");

const response = await fetch(url.toString(), {
  headers: {
    "User-Agent": "comic-hunter/1.0",
  },
});
```

**Environment Variables:**

- Always use `process.env.COMIC_VINE_API_KEY`
- Never hardcode API keys or tokens
- Check for missing environment variables and exit gracefully

**Logging:**

- Log request counts and progress for bulk operations
- Use descriptive console messages with emojis for user feedback
- Include timing information for performance monitoring
