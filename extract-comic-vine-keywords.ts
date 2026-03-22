import "dotenv/config";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

/**
 * Comic Vine API one-time keyword extraction
 *
 * Rate limit: 200 requests/hour = ~3.3 req/min
 * Strategy: Extract high-value characters, series, and publishers
 * Output: Weighted keywords for integration into lib/keywords.js
 *
 * Usage:
 *   node extract-comic-vine-keywords.js                    # Full extraction
 *   node extract-comic-vine-keywords.js --dry-run          # Test without API calls
 *   node extract-comic-vine-keywords.js --cache-only       # Use existing cache
 *   node extract-comic-vine-keywords.js --test characters  # Test single endpoint
 *   node extract-comic-vine-keywords.js --limit 50         # Limit results per endpoint
 */

const API_KEY = process.env.COMIC_VINE_API_KEY;
const BASE_URL = "https://comicvine.gamespot.com/api";
const RATE_LIMIT_MS = 20000; // 20 seconds between requests = 180/hour (buffer)
const CACHE_DIR = "./comic-vine-cache";

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isCacheOnly = args.includes("--cache-only");
const isTest = args.includes("--test");
const testEndpoint = isTest ? args[args.indexOf("--test") + 1] : null;
const limitArg = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1])
  : null;

if (!API_KEY && !isDryRun && !isCacheOnly) {
  console.error("Please set COMIC_VINE_API_KEY in your .env file");
  process.exit(1);
}

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Sleep utility for rate limiting
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ComicVineExtractor {
  constructor() {
    this.extractedKeywords = new Map();
    this.requestCount = 0;
    this.cacheHits = 0;

    if (isDryRun) {
      console.log("🧪 DRY RUN MODE: No API calls will be made");
    }
    if (isCacheOnly) {
      console.log("💾 CACHE ONLY MODE: Using cached responses only");
    }
    if (isTest && testEndpoint) {
      console.log(`🎯 TEST MODE: Testing ${testEndpoint} endpoint only`);
    }
  }

  getCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    return `${endpoint}_${JSON.stringify(sortedParams)}.json`;
  }

  getCachePath(cacheKey) {
    return path.join(CACHE_DIR, cacheKey);
  }

  loadFromCache(cacheKey) {
    const cachePath = this.getCachePath(cacheKey);
    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        this.cacheHits++;
        return cached;
      } catch (error) {
        console.warn(`⚠️  Invalid cache file: ${cacheKey}`);
        return null;
      }
    }
    return null;
  }

  saveToCache(cacheKey, data) {
    if (isDryRun) return; // Don't save in dry run mode

    const cachePath = this.getCachePath(cacheKey);
    try {
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn(`⚠️  Failed to save cache: ${cacheKey}`);
    }
  }

  async makeRequest(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);

    // Try cache first
    const cached = this.loadFromCache(cacheKey);
    if (cached) {
      console.log(
        `💾 [${this.cacheHits}] Cache hit: ${endpoint} (offset: ${params.offset || 0})`,
      );
      return cached;
    }

    // Cache only mode - don't make new requests
    if (isCacheOnly) {
      console.log(
        `❌ Cache miss (cache-only mode): ${endpoint} (offset: ${params.offset || 0})`,
      );
      return { results: [], error: "OK" }; // Return empty results
    }

    // Dry run mode - simulate response
    if (isDryRun) {
      console.log(
        `🧪 [DRY] Would fetch: ${endpoint} (offset: ${params.offset || 0})`,
      );
      await sleep(100); // Brief pause for realism
      return {
        results: [{ name: `mock-${endpoint}-${params.offset || 0}` }],
        error: "OK",
        number_of_total_results: 10,
      };
    }

    // Make actual API request
    const url = new URL(`${BASE_URL}/${endpoint}/`);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "100"); // Max results per request

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    console.log(
      `[${++this.requestCount}] Fetching: ${endpoint} (offset: ${params.offset || 0})`,
    );

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "comic-hunter-keyword-extractor/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.error !== "OK") {
      throw new Error(`Comic Vine error: ${data.error}`);
    }

    // Save to cache
    this.saveToCache(cacheKey, data);

    // Rate limiting
    await sleep(RATE_LIMIT_MS);

    return data;
  }

  addKeyword(keyword, weight, source) {
    if (!keyword || keyword.length < 3) return; // Skip short keywords

    const normalized = keyword.toLowerCase().trim();
    const existing = this.extractedKeywords.get(normalized);

    // Use highest weight if duplicate
    if (!existing || weight > existing.weight) {
      this.extractedKeywords.set(normalized, {
        keyword: normalized,
        weight,
        source,
        original: keyword,
      });
    }
  }

  async extractCharacters() {
    console.log("\n=== Extracting Characters ===");

    // Major + Indie publishers for comprehensive coverage
    let publishers = [
      // Major Publishers
      { name: "Marvel", id: 31, limit: 300 },
      { name: "DC Comics", id: 10, limit: 300 },
      { name: "Image", id: 2081, limit: 200 },
      { name: "Dark Horse Comics", id: 3075, limit: 150 },

      // Indie Publishers (high value for collectors)
      { name: "IDW Publishing", id: 2704, limit: 100 },
      { name: "BOOM! Studios", id: 3186, limit: 80 },
      { name: "Fantagraphics", id: 2820, limit: 100 },
      { name: "Drawn and Quarterly", id: 3142, limit: 80 },
      { name: "First Comics", id: 2950, limit: 60 },
      { name: "Kitchen Sink Press", id: 2845, limit: 80 },
      { name: "Slave Labor Graphics", id: 2876, limit: 60 },
      { name: "Oni Press", id: 2844, limit: 60 },
      { name: "Top Shelf", id: 2892, limit: 60 },
      { name: "Alternative Comics", id: 2968, limit: 50 },
      { name: "Archie Comics", id: 17, limit: 80 },
      { name: "Valiant", id: 15, limit: 100 },
      { name: "Dynamite Entertainment", id: 2186, limit: 80 },
    ];

    // Apply command line limit if specified
    if (limitArg) {
      publishers = publishers.map((p) => ({
        ...p,
        limit: Math.min(p.limit, limitArg),
      }));
      console.log(`📏 Limiting each publisher to ${limitArg} results`);
    }

    // For testing, only process first publisher
    if (isTest) {
      publishers = publishers.slice(0, 1);
      console.log(`🎯 Test mode: Processing only ${publishers[0].name}`);
    }

    for (const publisher of publishers) {
      console.log(`\nExtracting ${publisher.name} characters...`);

      let offset = 0;
      let hasMore = true;
      let characterCount = 0;

      while (hasMore && characterCount < publisher.limit) {
        // Dynamic limit per publisher
        const data = await this.makeRequest("characters", {
          filter: `publishers:${publisher.id}`,
          field_list: "name,aliases,real_name,publisher",
          offset: offset.toString(),
        });

        if (!data.results.length) {
          hasMore = false;
          break;
        }

        for (const char of data.results) {
          if (characterCount >= publisher.limit) break;

          // Main character name
          if (char.name) {
            this.addKeyword(char.name, 4, `character:${publisher.name}`);
            characterCount++;
          }

          // Real name (often searched)
          if (char.real_name && char.real_name !== char.name) {
            this.addKeyword(
              char.real_name,
              3,
              `character:${publisher.name}:real`,
            );
          }

          // Aliases
          if (char.aliases) {
            const aliases = char.aliases.split("\n").filter((a) => a.trim());
            aliases.slice(0, 3).forEach((alias) => {
              // Limit aliases
              this.addKeyword(
                alias.trim(),
                3,
                `character:${publisher.name}:alias`,
              );
            });
          }
        }

        offset += data.results.length;

        if (data.results.length < 100) {
          hasMore = false;
        }
      }

      console.log(`  Found ${characterCount} characters for ${publisher.name}`);
    }
  }

  async extractSeries() {
    console.log("\n=== Extracting Popular Series ===");

    // Comprehensive time ranges for comic history
    const timeRanges = [
      { name: "Current", start_year: "2020", limit: 200 },
      { name: "Modern", start_year: "2010", end_year: "2019", limit: 250 },
      {
        name: "Contemporary",
        start_year: "2000",
        end_year: "2009",
        limit: 200,
      },
      { name: "Classic", start_year: "1985", end_year: "1999", limit: 200 },
      { name: "Bronze", start_year: "1970", end_year: "1984", limit: 150 },
      { name: "Silver", start_year: "1956", end_year: "1969", limit: 100 },
      { name: "Golden", start_year: "1938", end_year: "1955", limit: 80 },
    ];

    for (const range of timeRanges) {
      console.log(`\nExtracting ${range.name} series...`);

      const filter = range.end_year
        ? `start_year:${range.start_year}|${range.end_year}`
        : `start_year:${range.start_year}`;

      let offset = 0;
      let seriesCount = 0;

      while (seriesCount < range.limit) {
        // Dynamic limit per time range
        const data = await this.makeRequest("volumes", {
          filter: filter,
          field_list: "name,publisher,start_year,count_of_issues",
          sort: "count_of_issues:desc", // Popular series have more issues
          offset: offset.toString(),
        });

        if (!data.results.length) break;

        for (const series of data.results) {
          if (seriesCount >= range.limit) break;

          if (series.name && series.count_of_issues > 5) {
            // Skip mini-series
            // Weight by issue count (popularity proxy)
            const weight = Math.min(
              6,
              2 + Math.floor(series.count_of_issues / 20),
            );
            this.addKeyword(
              series.name,
              weight,
              `series:${range.name.toLowerCase()}`,
            );
            seriesCount++;
          }
        }

        offset += data.results.length;

        if (data.results.length < 100) break;
      }

      console.log(`  Found ${seriesCount} series for ${range.name}`);
    }
  }

  async extractTeams() {
    console.log("\n=== Extracting Teams ===");

    let offset = 0;
    let teamCount = 0;

    while (teamCount < 200) {
      const data = await this.makeRequest("teams", {
        field_list: "name,aliases,publisher",
        sort: "date_added:desc",
        offset: offset.toString(),
      });

      if (!data.results.length) break;

      for (const team of data.results) {
        if (teamCount >= 200) break;

        if (team.name) {
          this.addKeyword(team.name, 4, "team");
          teamCount++;
        }

        // Team aliases
        if (team.aliases) {
          const aliases = team.aliases.split("\n").filter((a) => a.trim());
          aliases.slice(0, 2).forEach((alias) => {
            this.addKeyword(alias.trim(), 3, "team:alias");
          });
        }
      }

      offset += data.results.length;
      if (data.results.length < 100) break;
    }

    console.log(`  Found ${teamCount} teams`);
  }

  async extractCreators() {
    console.log("\n=== Extracting Creators ===");

    let offset = 0;
    let creatorCount = 0;

    while (creatorCount < 300) {
      const data = await this.makeRequest("people", {
        field_list: "name,aliases",
        sort: "date_added:desc",
        offset: offset.toString(),
      });

      if (!data.results.length) break;

      for (const creator of data.results) {
        if (creatorCount >= 300) break;

        if (creator.name && creator.name.length > 3) {
          // Higher weight for well-known creators
          const notableCreators = [
            "stan lee",
            "jack kirby",
            "steve ditko",
            "john byrne",
            "chris claremont",
            "frank miller",
            "alan moore",
            "neil gaiman",
            "grant morrison",
            "warren ellis",
            "brian michael bendis",
            "geoff johns",
            "robert kirkman",
            "todd mcfarlane",
            "jim lee",
          ];

          const weight = notableCreators.some((notable) =>
            creator.name.toLowerCase().includes(notable),
          )
            ? 5
            : 2;

          this.addKeyword(creator.name, weight, "creator");
          creatorCount++;
        }
      }

      offset += data.results.length;
      if (data.results.length < 100) break;
    }

    console.log(`  Found ${creatorCount} creators`);
  }

  async extractStoryArcs() {
    console.log("\n=== Extracting Story Arcs ===");

    let offset = 0;
    let arcCount = 0;

    while (arcCount < 150) {
      const data = await this.makeRequest("story_arcs", {
        field_list: "name,publisher",
        sort: "date_added:desc",
        offset: offset.toString(),
      });

      if (!data.results.length) break;

      for (const arc of data.results) {
        if (arcCount >= 150) break;

        if (arc.name && arc.name.length > 3) {
          // Major crossover events get higher weight
          const majorEvents = [
            "crisis",
            "infinity",
            "secret wars",
            "civil war",
            "dark reign",
            "blackest night",
            "flashpoint",
            "age of apocalypse",
            "house of m",
          ];

          const weight = majorEvents.some((event) =>
            arc.name.toLowerCase().includes(event),
          )
            ? 5
            : 3;

          this.addKeyword(arc.name, weight, "story_arc");
          arcCount++;
        }
      }

      offset += data.results.length;
      if (data.results.length < 100) break;
    }

    console.log(`  Found ${arcCount} story arcs`);
  }

  async extractPublishers() {
    console.log("\n=== Extracting Publishers ===");

    const data = await this.makeRequest("publishers", {
      field_list: "name,aliases",
      sort: "name:asc",
      limit: "100", // Include more indie publishers
    });

    for (const pub of data.results) {
      if (pub.name) {
        // Categorize publishers by importance/collectibility
        const majorPublishers = ["Marvel", "DC Comics", "Image", "Dark Horse"];

        const indiePublishers = [
          "IDW",
          "BOOM!",
          "Dynamite",
          "Fantagraphics",
          "Drawn",
          "Kitchen Sink",
          "Slave Labor",
          "Oni Press",
          "Top Shelf",
          "Alternative Comics",
          "First Comics",
          "Valiant",
          "Archie",
        ];
        const weight = majorPublishers.some((major) => pub.name.includes(major))
          ? 4
          : indiePublishers.some((indie) =>
                pub.name.toLowerCase().includes(indie.toLowerCase()),
              )
            ? 3
            : 2;

        this.addKeyword(pub.name, weight, "publisher");

        // Publisher aliases
        if (pub.aliases) {
          const aliases = pub.aliases
            .split("\n")
            .filter((a) => a.trim())
            .slice(0, 2);
          aliases.forEach((alias) => {
            this.addKeyword(alias.trim(), weight - 1, "publisher:alias");
          });
        }
      }
    }

    console.log(`  Found ${data.results.length} publishers`);
  }

  compareWithExisting() {
    console.log("\n=== Comparing with Existing Keywords ===");

    // Read existing keywords from lib/keywords.js
    const existingKeywords = new Set([
      "free",
      "$0",
      "no charge",
      "give away",
      "giveaway",
      "take it all",
      "obo",
      "or best offer",
      "cheap",
      "clearing out",
      "downsizing",
      "estate",
      "lot",
      "longbox",
      "long box",
      "collection",
      "bundle",
      "bulk",
      "box",
      "run",
      "marvel",
      "dc comics",
      "image",
      "dark horse",
      "tmnt",
      "teenage mutant",
      "x-men",
      "spider-man",
      "batman",
      "spawn",
      "wolverine",
      "venom",
      "cgc",
      "graded",
      "slabbed",
      "psa",
      "bgs",
      "sgc",
      "statue",
      "variant",
      "first appearance",
      "first print",
      "key issue",
      "silver age",
      "bronze age",
      "golden age",
      "indy",
      "fantagraphics",
      "drawn & quarterly",
      "kitchen sink press",
      "love and rockets",
      "saga",
      "invincible",
      "walking dead",
      "house of x",
      "powers of x",
      "immortal hulk",
      "ultimate spider-man",
      "ultimate fallout",
      "miles morales",
      "harley quinn",
      "newsstand",
      "direct edition",
      "nm/mt",
      "vf/nm",
      "mint condition",
      "cbcs",
      "pgx",
      "dc black label",
      "marvel knights",
      "vertigo",
      "wildstorm",
      "boom studios",
    ]);

    // Find new keywords not in existing list
    const newKeywords = [];
    const duplicates = [];

    this.extractedKeywords.forEach((data, keyword) => {
      if (existingKeywords.has(keyword)) {
        duplicates.push(keyword);
      } else {
        newKeywords.push({ keyword, ...data });
      }
    });

    console.log(
      `Found ${newKeywords.length} new keywords not in existing list`,
    );
    console.log(`Found ${duplicates.length} keywords already covered`);

    // Show top new additions
    newKeywords.sort((a, b) => b.weight - a.weight);
    console.log("\n🔥 Top 20 new keyword additions:");
    newKeywords.slice(0, 20).forEach((kw, i) => {
      console.log(
        `${i + 1}. "${kw.keyword}" (weight: ${kw.weight}) - ${kw.source}`,
      );
    });
  }

  async run() {
    console.log("🚀 Comic Vine Keyword Extraction Starting...");
    console.log(`Rate limit: ${RATE_LIMIT_MS / 1000}s between requests`);

    try {
      // Test mode - run only specified endpoint
      if (isTest && testEndpoint) {
        switch (testEndpoint.toLowerCase()) {
          case "characters":
            await this.extractCharacters();
            break;
          case "series":
            await this.extractSeries();
            break;
          case "teams":
            await this.extractTeams();
            break;
          case "creators":
            await this.extractCreators();
            break;
          case "story-arcs":
          case "storyarcs":
            await this.extractStoryArcs();
            break;
          case "publishers":
            await this.extractPublishers();
            break;
          default:
            throw new Error(
              `Unknown test endpoint: ${testEndpoint}. Use: characters, series, teams, creators, story-arcs, publishers`,
            );
        }
      } else {
        // Full extraction
        await this.extractCharacters();
        await this.extractSeries();
        await this.extractTeams();
        await this.extractCreators();
        await this.extractStoryArcs();
        await this.extractPublishers();
      }

      this.compareWithExisting();
      this.generateOutput();
    } catch (error) {
      console.error("\n❌ Extraction failed:", error.message);
      process.exit(1);
    }
  }

  generateOutput() {
    console.log("\n=== Extraction Complete ===");
    console.log(
      `Total unique keywords extracted: ${this.extractedKeywords.size}`,
    );
    console.log(`API requests made: ${this.requestCount}`);
    console.log(`Cache hits: ${this.cacheHits}`);

    if (isDryRun) {
      console.log("\n🧪 DRY RUN: No files were saved or API calls made");
      return;
    }

    // Sort by weight (highest first)
    const sortedKeywords = Array.from(this.extractedKeywords.values()).sort(
      (a, b) => b.weight - a.weight,
    );

    // Group by source for analysis
    const bySource = {};
    sortedKeywords.forEach((kw) => {
      const source = kw.source.split(":")[0];
      if (!bySource[source]) bySource[source] = [];
      bySource[source].push(kw);
    });

    console.log("\nBreakdown by source:");
    Object.entries(bySource).forEach(([source, keywords]) => {
      console.log(`  ${source}: ${keywords.length} keywords`);
    });

    // Generate JavaScript array format
    const jsArray = sortedKeywords
      .slice(0, 1000) // Top 1000 keywords (increased from 500)
      .map(
        (kw) =>
          `  ["${kw.keyword.replace(/"/g, '\\"')}", ${kw.weight}], // ${kw.source}`,
      )
      .join("\n");

    const output = `// Comic Vine extracted keywords - ${new Date().toISOString().split("T")[0]}
// Generated ${sortedKeywords.length} total keywords, showing top 1000

export const COMIC_VINE_KEYWORDS = [
${jsArray}
];

// For integration with main keywords.js:
// import { COMIC_VINE_KEYWORDS } from './comic-vine-keywords.js';`;

    // Save to file
    fs.writeFileSync("comic-vine-keywords.js", output);

    console.log("\n✅ Keywords saved to: comic-vine-keywords.js");
    console.log("\n📝 Next steps:");
    console.log("1. Review generated keywords for quality");
    console.log("2. Manually merge high-value keywords into lib/keywords.js");
    console.log("3. Test scoring changes with dashboard");
    console.log("4. Adjust weights based on alert performance");

    // Show preview of top keywords
    console.log("\n🔝 Top 20 keywords preview:");
    sortedKeywords.slice(0, 20).forEach((kw, i) => {
      console.log(
        `${i + 1}. "${kw.keyword}" (weight: ${kw.weight}) - ${kw.source}`,
      );
    });
  }
}

// Show help message
function showHelp() {
  console.log(`
🦸 Comic Vine API Keyword Extractor

Usage:
  node extract-comic-vine-keywords.js [options]

Options:
  --help                    Show this help message
  --dry-run                 Test without making API calls (uses mock data)
  --cache-only              Use only cached responses (no new API calls)
  --test <endpoint>         Test single endpoint (characters, series, teams, creators, story-arcs, publishers)
  --limit <number>          Limit results per endpoint for testing
  
Examples:
  node extract-comic-vine-keywords.js --test characters --limit 10
  node extract-comic-vine-keywords.js --dry-run --limit 5
  node extract-comic-vine-keywords.js --cache-only
  node extract-comic-vine-keywords.js                    # Full extraction

Cache:
  Responses are cached in ./comic-vine-cache/ to avoid duplicate API calls
  Delete cache directory to force fresh API requests
`);
}

// Parse help request
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

// Run the extraction
const extractor = new ComicVineExtractor();
extractor.run().catch(console.error);
