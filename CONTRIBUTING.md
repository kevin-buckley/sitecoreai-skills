# Contributing

## Adding or changing a skill

Every skill is one directory under `skills/` containing a `SKILL.md`. The directory name is the
skill's identity — it must match the `name` in the frontmatter exactly, and everything here is
prefixed `sitecore-` so the names don't collide with skills installed from elsewhere.

```
skills/sitecore-example/
├── SKILL.md          # required
├── references/       # optional: detail loaded on demand
├── scripts/          # optional: executable helpers
└── assets/           # optional: templates, data files
```

Frontmatter — the spec allows only `name`, `description`, `license`, `compatibility`, `metadata`,
and `allowed-tools` at the top level. Anything else belongs under `metadata`:

```yaml
---
name: sitecore-example
description: >-
  What it does. Use when <the situations it applies to>, or when the user mentions
  <keywords>. For <adjacent concern>, use sitecore-other-skill instead.
license: Apache-2.0
metadata:
  display-name: "Example"
  category: project-review      # migration | authoring | project-review
  tags: "audit, example"
---
```

`metadata` is for organizing this catalog; no agent reads it. Do not add a `triggers` key — trigger
phrases belong in `description`, which is the only field an agent matches on.

Run the validator before opening a PR. CI runs the same command.

```bash
node scripts/validate-skills.mjs
```

## Writing the description

The `description` is the only thing an agent sees until it decides to load the skill, so it carries
the entire triggering burden. Follow
[agentskills.io's guidance](https://agentskills.io/skill-creation/optimizing-descriptions):

- **Say what it does, then when to use it.** The validator warns if a description has no "Use when".
- **Write for user intent, not mechanics.** Agents match against what someone asked for.
- **Cover the vocabulary people actually use,** including cases where they never name the domain.
- **Draw the boundary.** Several skills here overlap — say which adjacent skill owns the
  neighbouring concern, the way `sitecore-frontend-performance` and `sitecore-headless-performance`
  point at each other. This is what keeps the wrong one from loading.
- **Name the platform SitecoreAI, and keep "XM Cloud" in the text.** SitecoreAI is the current
  name, but people will say XM Cloud for years. Every description here mentions both so either
  phrasing matches.
- **Stay under 1024 characters.** Enforced.

## Writing the body

- **Add what the agent lacks.** Sitecore-specific behavior, version-specific quirks, the GUIDs and
  encodings nobody remembers. Not what a general-purpose model already knows about React or HTTP.
- **Gotchas earn their space.** The highest-value content in this repo is things like the asymmetric
  `TemplatesMapping` encoding and renderings on a Page Design's own Final Renderings never
  rendering — facts that defy a reasonable assumption. When an agent gets something wrong and you
  correct it, that correction belongs in a skill.
- **Keep `SKILL.md` under 500 lines and ~5,000 tokens.** Move detail into `references/` and say
  in `SKILL.md` *when* to read each file — "read `references/x.md` if <condition>", not "see
  references/ for details". The validator warns when a body exceeds the budget.
- **Prefer a default over a menu.** Pick the recommended approach and mention alternatives briefly.
- **Cross-reference by full name** (`sitecore-page-design-setup`, not `page-design-setup`).

## Scope

This repo is for SitecoreAI: migrating to it from XP, building on it, and auditing a build on it.
Today the skills cover the CMS side — content, templates, presentation, Headless SXA, and the
Content SDK rendering host.

SitecoreAI also absorbed Content Hub, Search, Personalize, CDP, and Stream, so skills for those are
in scope for the platform in a way they were not under the XM Cloud branding. They are still worth
raising as a discussion first: each brings vocabulary that overlaps badly with the CMS skills, and
the `migration` / `authoring` / `project-review` categories may not be the right split for them.
OrderCloud remains a separate product.
