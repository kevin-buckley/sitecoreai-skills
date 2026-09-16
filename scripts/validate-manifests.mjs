#!/usr/bin/env node
// Checks the packaging manifests: valid JSON, the plugin points at this repo's
// skills, and the version is the same in every place that records it.
//
// Zero dependencies, same as validate-skills.mjs.
// Usage: node scripts/validate-manifests.mjs

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function readJson(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) {
    errors.push(`${rel}: missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    errors.push(`${rel}: invalid JSON — ${e.message}`);
    return null;
  }
}

const plugin = readJson(".claude-plugin/plugin.json");
const marketplace = readJson(".claude-plugin/marketplace.json");
const pkg = readJson("package.json");

// plugin.json
if (plugin) {
  if (!plugin.name) errors.push("plugin.json: missing `name`");
  if (!plugin.version) errors.push("plugin.json: missing `version`");
  if (!plugin.description) errors.push("plugin.json: missing `description`");
  if (!plugin.author?.name) errors.push("plugin.json: missing `author.name`");
}

// marketplace.json
let entry = null;
if (marketplace) {
  if (!marketplace.name) errors.push("marketplace.json: missing `name`");
  if (!marketplace.owner?.name) errors.push("marketplace.json: missing `owner.name`");
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    errors.push("marketplace.json: `plugins` must be a non-empty array");
  } else {
    for (const p of marketplace.plugins) {
      if (!p.name) errors.push("marketplace.json: a plugin entry is missing `name`");
      if (!p.source) errors.push(`marketplace.json: plugin "${p.name}" is missing \`source\``);
    }
    entry = marketplace.plugins.find((p) => p.name === plugin?.name);
    if (!entry) {
      errors.push(
        `marketplace.json: no plugin entry named "${plugin?.name}" to match plugin.json`,
      );
    }
  }
}

// Versions must agree, or an install silently ships a number that means nothing.
const versions = {
  "plugin.json": plugin?.version,
  "marketplace.json entry": entry?.version,
  "package.json": pkg?.version,
};
const distinct = [...new Set(Object.values(versions).filter(Boolean))];
if (distinct.length > 1) {
  errors.push(
    `version mismatch — ${Object.entries(versions)
      .map(([k, v]) => `${k}=${v ?? "(unset)"}`)
      .join(", ")}`,
  );
}

// The plugin's skills/ must be this repo's skills/, since source is "./".
if (entry && entry.source === "./") {
  const skillsDir = join(ROOT, "skills");
  if (!existsSync(skillsDir)) {
    errors.push("skills/ is missing, but the plugin source is the repo root");
  } else {
    const count = readdirSync(skillsDir).filter(
      (d) => statSync(join(skillsDir, d)).isDirectory() && existsSync(join(skillsDir, d, "SKILL.md")),
    ).length;
    if (count === 0) errors.push("skills/ contains no skill directories for the plugin to ship");
    else console.log(`Plugin ships ${count} auto-discovered skill${count === 1 ? "" : "s"}.`);
  }
}

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  for (const e of errors) console.log(`  x ${e}`);
  process.exit(1);
}

console.log(`Manifests are consistent at version ${distinct[0] ?? "(unset)"}.`);
