/**
 * viewer.js
 * ---------
 * CLI tool to browse what the streamer has logged.
 *
 * Usage:
 *   node viewer.js              # top 20 hits by score
 *   node viewer.js --all        # show everything
 *   node viewer.js --min 20     # score >= 20 only
 *   node viewer.js --limit 50   # show 50 rows
 */

import initSqlJs from "sql.js";
import { readFileSync, existsSync } from "fs";

const DB_PATH = "seen_posts.db";
const args    = process.argv.slice(2);

const showAll = args.includes("--all");
const minScore = (() => {
  const i = args.indexOf("--min");
  return i !== -1 ? parseInt(args[i + 1], 10) : 0;
})();
const limit = (() => {
  const i = args.indexOf("--limit");
  return i !== -1 ? parseInt(args[i + 1], 10) : 20;
})();

const SQL = await initSqlJs();

if (!existsSync(DB_PATH)) {
  console.log("No database found yet. Run streamer.js first.");
  process.exit(0);
}

const db = new SQL.Database(readFileSync(DB_PATH));

let query = "SELECT post_id, subreddit, score, title, seen_at FROM seen";
if (minScore > 0) query += ` WHERE score >= ${minScore}`;
query += " ORDER BY score DESC";
if (!showAll) query += ` LIMIT ${limit}`;

const result = db.exec(query);

if (!result.length || !result[0].values.length) {
  console.log("No results found.");
  process.exit(0);
}

const rows = result[0].values;

console.log(`\n${"SCORE".padStart(6)}  ${"SUBREDDIT".padEnd(24)}  ${"SEEN AT".padEnd(20)}  TITLE`);
console.log("─".repeat(100));

for (const [postId, subreddit, score, title, seenAt] of rows) {
  const scoreStr    = String(score).padStart(6);
  const subStr      = `r/${subreddit}`.padEnd(24);
  const dateStr     = String(seenAt).slice(0, 19).padEnd(20);
  const titleStr    = String(title).slice(0, 45);
  console.log(`${scoreStr}  ${subStr}  ${dateStr}  ${titleStr}`);
}

console.log(`\n${rows.length} row(s) shown.`);
console.log(`\nTip: visit https://reddit.com/comments/{post_id} for any row above`);
