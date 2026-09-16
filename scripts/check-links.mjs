#!/usr/bin/env node
// Checks every external link in the skills for rot.
//
// Sitecore's docs moved from /xmc/ to /sai/ during the SitecoreAI rebrand and
// the old deep links are decaying, so this runs in CI where there is real
// network access. Zero dependencies; needs Node 18+ for global fetch.
//
//   node scripts/check-links.mjs            # report and exit non-zero on dead links
//   node scripts/check-links.mjs --warn     # report but always exit 0

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WARN_ONLY = process.argv.includes("--warn");
const TIMEOUT_MS = 30_000;
const CONCURRENCY = 4;
const RETRIES = 2;

// Hosts that only ever appear as illustrative examples.
const SKIP_HOSTS = [/(^|\.)localhost$/i, /^127\./, /(^|\.)example\.(com|org|net)$/i];

// A bare fetch gets bot-blocked by several docs hosts, which looks identical to
// rot if you only read the status code. Ask like a browser.
const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
};

// Collect every markdown file under skills/, plus the top-level docs.
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = [
  ...walk(join(ROOT, "skills")),
  ...["README.md", "CONTRIBUTING.md"].map((f) => join(ROOT, f)).filter(existsSync),
];

// Bare URLs and markdown link targets alike.
const URL_RE = /https?:\/\/[^\s)<>\]"'`]+/g;

const found = new Map(); // url -> Set of files
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(URL_RE)) {
    const url = m[0].replace(/[.,;:]+$/, "");
    if (!found.has(url)) found.set(url, new Set());
    found.get(url).add(file.slice(ROOT.length + 1).replace(/\\/g, "/"));
  }
}

const urls = [...found.keys()]
  .filter((u) => {
    let host;
    try {
      host = new URL(u).hostname;
    } catch {
      return false;
    }
    return !SKIP_HOSTS.some((re) => re.test(host));
  })
  .sort();
if (urls.length === 0) {
  console.log("No external links found.");
  process.exit(0);
}

console.log(`Checking ${urls.length} unique link(s) across ${files.length} file(s)...\n`);

async function attempt(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, method, headers: HEADERS });
    return { url, status: res.status, final: res.url };
  } catch (e) {
    return { url, status: 0, error: e.name === "AbortError" ? "timeout" : e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  let last;
  for (let i = 0; i <= RETRIES; i++) {
    // Some hosts reject HEAD outright, so fall back to GET.
    last = await attempt(url, "HEAD");
    if (last.status === 405 || last.status === 501 || last.status === 0) {
      last = await attempt(url, "GET");
    }
    // Retry only what might be transient.
    if (last.status !== 0 && last.status !== 429 && last.status < 500) return last;
    if (i < RETRIES) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  return last;
}

// Small worker pool so we do not hammer a docs host.
const results = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      results.push(await check(url));
    }
  }),
);
results.sort((a, b) => a.url.localeCompare(b.url));

const dead = [];
const moved = [];
const blocked = [];
for (const r of results) {
  if (r.status === 403 || r.status === 429) blocked.push(r);
  else if (r.status === 0) dead.push({ ...r, reason: r.error });
  else if (r.status >= 400) dead.push({ ...r, reason: `HTTP ${r.status}` });
  // A .git clone URL always redirects to the web page; that is not a move.
  else if (r.final && r.final !== r.url && !r.url.endsWith(".git")) moved.push(r);
}

if (moved.length) {
  console.log(`Redirected (${moved.length}) — consider updating to the destination:`);
  for (const r of moved) {
    console.log(`  ~ ${r.url}`);
    console.log(`    -> ${r.final}`);
  }
  console.log("");
}

if (blocked.length) {
  console.log(`Blocked (${blocked.length}) — bot protection refused us, NOT evidence the page is gone:`);
  for (const r of blocked) console.log(`  ? ${r.url}  [HTTP ${r.status}]`);
  console.log("");
}

if (dead.length) {
  console.log(`Dead (${dead.length}):`);
  for (const r of dead) {
    console.log(`  x ${r.url}  [${r.reason}]`);
    for (const f of found.get(r.url)) console.log(`      in ${f}`);
  }
  console.log("");
}

const ok = results.length - dead.length - blocked.length;
console.log(
  `${ok}/${results.length} reachable, ${blocked.length} blocked (inconclusive), ${dead.length} dead.`,
);

if (dead.length && !WARN_ONLY) process.exit(1);
