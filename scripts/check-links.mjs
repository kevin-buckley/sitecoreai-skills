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

const urls = [...found.keys()].sort();
if (urls.length === 0) {
  console.log("No external links found.");
  process.exit(0);
}

console.log(`Checking ${urls.length} unique link(s) across ${files.length} file(s)...\n`);

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Some docs hosts reject HEAD, so fall back to GET.
    let res = await fetch(url, { redirect: "follow", signal: ctrl.signal, method: "HEAD" });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { redirect: "follow", signal: ctrl.signal });
    }
    return { url, status: res.status, final: res.url };
  } catch (e) {
    return { url, status: 0, error: e.name === "AbortError" ? "timeout" : e.message };
  } finally {
    clearTimeout(timer);
  }
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
for (const r of results) {
  if (r.status === 0) dead.push({ ...r, reason: r.error });
  else if (r.status >= 400) dead.push({ ...r, reason: `HTTP ${r.status}` });
  else if (r.final && r.final !== r.url) moved.push(r);
}

if (moved.length) {
  console.log(`Redirected (${moved.length}) — consider updating to the destination:`);
  for (const r of moved) {
    console.log(`  ~ ${r.url}`);
    console.log(`    -> ${r.final}`);
  }
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

const ok = results.length - dead.length;
console.log(`${ok}/${results.length} link(s) reachable.`);

if (dead.length && !WARN_ONLY) process.exit(1);
