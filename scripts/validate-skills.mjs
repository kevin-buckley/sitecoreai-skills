#!/usr/bin/env node
// Validates every skill in skills/ against the Agent Skills specification.
// https://agentskills.io/specification
//
// Zero dependencies on purpose: this runs in CI and in a bare checkout.
// Usage: node scripts/validate-skills.mjs [skills-dir]

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = resolve(process.argv[2] ?? join(ROOT, "skills"));

// Spec-defined frontmatter keys. Anything else belongs under `metadata`.
const KNOWN_KEYS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Repo convention, not part of the spec.
const CATEGORIES = new Set(["migration", "authoring", "project-review"]);

// Recommended ceilings from the spec's progressive-disclosure section.
const MAX_BODY_LINES = 500;
const MAX_BODY_TOKENS = 5000;

const errors = [];
const warnings = [];

function err(skill, msg) {
  errors.push(`${skill}: ${msg}`);
}
function warn(skill, msg) {
  warnings.push(`${skill}: ${msg}`);
}

/**
 * Minimal YAML frontmatter reader covering the subset the spec allows:
 * top-level scalars, folded block scalars (`>-` / `>` / `|`), and a
 * single-level `metadata:` mapping. Deliberately strict — anything it
 * cannot parse is reported rather than silently ignored.
 */
function parseFrontmatter(raw, skill) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
  if (!match) {
    err(skill, "SKILL.md must start with a YAML frontmatter block delimited by ---");
    return null;
  }

  const [, block, body = ""] = match;
  const lines = block.split(/\r?\n/);
  const data = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) {
      err(skill, `cannot parse frontmatter line ${i + 1}: ${JSON.stringify(line)}`);
      i++;
      continue;
    }

    const [, key, rest] = kv;
    const value = rest.trim();

    if (value === "" ) {
      // Either a block scalar with no indicator, or a nested mapping.
      const nested = {};
      i++;
      while (i < lines.length && /^\s+\S/.test(lines[i])) {
        const sub = lines[i].match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!sub) {
          err(skill, `cannot parse nested frontmatter line ${i + 1}: ${JSON.stringify(lines[i])}`);
        } else {
          nested[sub[1]] = unquote(sub[2].trim());
        }
        i++;
      }
      data[key] = nested;
      continue;
    }

    if (value === ">-" || value === ">" || value === "|" || value === "|-") {
      const fold = value.startsWith(">");
      const parts = [];
      i++;
      while (i < lines.length && (/^\s+/.test(lines[i]) || lines[i].trim() === "")) {
        parts.push(lines[i].trim());
        i++;
      }
      data[key] = fold ? parts.join(" ").trim() : parts.join("\n").trim();
      continue;
    }

    data[key] = unquote(value);
    i++;
  }

  return { data, body };
}

function unquote(v) {
  if (v.length >= 2 && ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'"))) {
    try {
      return v[0] === '"' ? JSON.parse(v) : v.slice(1, -1);
    } catch {
      return v.slice(1, -1);
    }
  }
  return v;
}

function validateSkill(dirName) {
  const skillDir = join(SKILLS_DIR, dirName);
  const skillFile = join(skillDir, "SKILL.md");

  if (!existsSync(skillFile)) {
    err(dirName, "missing required SKILL.md");
    return;
  }

  const raw = readFileSync(skillFile, "utf8");
  const parsed = parseFrontmatter(raw, dirName);
  if (!parsed) return;
  const { data, body } = parsed;

  for (const key of Object.keys(data)) {
    if (!KNOWN_KEYS.has(key)) {
      err(
        dirName,
        `unknown frontmatter key "${key}" — the spec defines only ${[...KNOWN_KEYS].join(", ")}; move custom fields under "metadata"`,
      );
    }
  }

  // name
  const name = data.name;
  if (typeof name !== "string" || name.length === 0) {
    err(dirName, "frontmatter is missing the required `name` field");
  } else {
    if (name.length > 64) err(dirName, `name is ${name.length} characters (max 64)`);
    if (!NAME_RE.test(name)) {
      err(
        dirName,
        `name "${name}" must be lowercase alphanumerics and single hyphens only, with no leading, trailing, or consecutive hyphens`,
      );
    }
    if (name !== dirName) err(dirName, `name "${name}" must match its parent directory name "${dirName}"`);
  }

  // description
  const description = data.description;
  if (typeof description !== "string" || description.trim().length === 0) {
    err(dirName, "frontmatter is missing the required `description` field");
  } else {
    if (description.length > 1024) err(dirName, `description is ${description.length} characters (max 1024)`);
    if (description.length < 40) {
      warn(dirName, `description is only ${description.length} characters — say what it does AND when to use it`);
    }
    if (!/\buse (this skill )?when\b/i.test(description)) {
      warn(dirName, 'description does not say when to use the skill (expected an imperative "Use when ...")');
    }
  }

  // compatibility
  if (data.compatibility !== undefined) {
    if (typeof data.compatibility !== "string" || data.compatibility.length === 0) {
      err(dirName, "compatibility must be a non-empty string");
    } else if (data.compatibility.length > 500) {
      err(dirName, `compatibility is ${data.compatibility.length} characters (max 500)`);
    }
  }

  // metadata must be a flat string -> string map
  if (data.metadata !== undefined) {
    if (typeof data.metadata !== "object" || data.metadata === null || Array.isArray(data.metadata)) {
      err(dirName, "metadata must be a mapping of string keys to string values");
    } else {
      for (const [k, v] of Object.entries(data.metadata)) {
        if (typeof v !== "string") err(dirName, `metadata.${k} must be a string value`);
      }
    }
  }

  // --- repo conventions (not spec requirements; see CONTRIBUTING.md) ---
  if (data.metadata && typeof data.metadata === "object") {
    if (data.metadata.triggers !== undefined) {
      warn(
        dirName,
        'metadata.triggers is not read by any agent — fold those phrases into `description`, which is the only field used for matching',
      );
    }
    const category = data.metadata.category;
    if (category !== undefined && !CATEGORIES.has(category)) {
      warn(dirName, `metadata.category "${category}" is not one of ${[...CATEGORIES].join(", ")}`);
    }
  }

  // SitecoreAI was named XM Cloud until Symposium 2025. Descriptions keep the old
  // name so a skill still matches someone who says it.
  if (typeof description === "string" && /SitecoreAI/.test(description) && !/XM Cloud/.test(description)) {
    warn(dirName, 'description names SitecoreAI but not "XM Cloud" — keep the former name so the skill still matches it');
  }

  if (data.license !== undefined && typeof data.license !== "string") {
    err(dirName, "license must be a string");
  }
  if (data["allowed-tools"] !== undefined && typeof data["allowed-tools"] !== "string") {
    err(dirName, "allowed-tools must be a space-separated string");
  }

  // body: progressive-disclosure budget
  const bodyLines = body.split(/\r?\n/).length;
  if (bodyLines > MAX_BODY_LINES) {
    warn(dirName, `SKILL.md body is ${bodyLines} lines (recommended max ${MAX_BODY_LINES}) — move detail into references/`);
  }
  const approxTokens = Math.ceil(body.length / 4);
  if (approxTokens > MAX_BODY_TOKENS) {
    warn(dirName, `SKILL.md body is ~${approxTokens} tokens (recommended max ${MAX_BODY_TOKENS}) — move detail into references/`);
  }
  if (body.trim().length === 0) {
    err(dirName, "SKILL.md has no body content after the frontmatter");
  }

  // relative file references must resolve
  for (const m of body.matchAll(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)) {
    const target = m[1].split("#")[0];
    if (!target) continue;
    if (!existsSync(join(skillDir, target))) {
      err(dirName, `references a file that does not exist: ${target}`);
    }
  }

  return { name: typeof name === "string" ? name : dirName, description: description ?? "", metadata: data.metadata ?? {} };
}

if (!existsSync(SKILLS_DIR)) {
  console.error(`No skills directory at ${SKILLS_DIR}`);
  process.exit(1);
}

const dirs = readdirSync(SKILLS_DIR)
  .filter((d) => statSync(join(SKILLS_DIR, d)).isDirectory())
  .sort();

if (dirs.length === 0) {
  console.error(`No skills found in ${SKILLS_DIR}`);
  process.exit(1);
}

const seen = new Map();
for (const dir of dirs) {
  const result = validateSkill(dir);
  if (result?.name) {
    if (seen.has(result.name)) err(dir, `duplicate skill name "${result.name}" (also used by ${seen.get(result.name)})`);
    seen.set(result.name, dir);
  }
}

console.log(`Validated ${dirs.length} skill${dirs.length === 1 ? "" : "s"} in ${SKILLS_DIR}\n`);

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) console.log(`  x ${e}`);
  console.log("");
  process.exit(1);
}

console.log("All skills conform to the Agent Skills specification.");
