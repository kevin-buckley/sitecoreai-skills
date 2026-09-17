# Sitecore Skills

Agent Skills for building on **SitecoreAI** (the platform formerly named **Sitecore XM Cloud**) —
migrating in from Sitecore XP, and auditing a SitecoreAI SXA Headless / Content SDK project once it
exists.

> **Naming.** Sitecore retired the XM Cloud brand at Symposium 2025, folding the CMS together with
> Content Hub, Search, Personalize, CDP, and Stream into a single platform called SitecoreAI. These
> skills use *SitecoreAI* throughout for the platform, and keep the unchanged technical names —
> Experience Edge, Content SDK, Headless SXA, the `dotnet sitecore` CLI — as they are. Every
> description also carries "XM Cloud" so the skills still match if you or your team still say it.

26 skills, conforming to the [Agent Skills specification](https://agentskills.io/specification).
They work in any skills-compatible agent: Claude Code, Claude, Cursor, Copilot, Codex, Gemini CLI,
OpenCode, Goose, and [others](https://agentskills.io/clients).

## Install

### Any agent, via GitHub CLI (easiest)

`gh skill` knows where each agent keeps its skills, so you do not have to:

```bash
gh skill install kevin-buckley/sitecoreai-skills --agent codex
gh skill install kevin-buckley/sitecoreai-skills --agent github-copilot
gh skill install kevin-buckley/sitecoreai-skills --agent cursor --scope user
gh skill update                       # update everything installed this way
```

`--scope user` installs for every project; the default, `project`, installs into the current repo.
Pin a release with `--pin v1.1.1`. Claude Code, Codex, Copilot, Cursor, Gemini CLI, Amp, Goose,
Junie, OpenCode, Windsurf and ~30 more are supported — run `gh skill install --help` for the list.
The command is in preview and ships with recent `gh`.

### Claude Code, via the plugin

Claude Code can also install this as a plugin, which adds update-in-place and the plugin details UI:

```
/plugin marketplace add kevin-buckley/sitecoreai-skills
/plugin install sitecoreai-skills@sitecoreai-skills
```

To update later:

```
/plugin marketplace update
/plugin update sitecoreai-skills
```

Pin to a release instead of tracking `main` with
`/plugin marketplace add kevin-buckley/sitecoreai-skills@v1.2.0`.

### From a clone

Use this when you want a subset, a symlinked working copy, or an agent `gh skill` does not cover.

```bash
git clone https://github.com/kevin-buckley/sitecoreai-skills.git
cd sitecoreai-skills

./scripts/install.sh                                   # all 26 -> ~/.claude/skills
./scripts/install.sh --dest ~/.agents/skills           # somewhere else
./scripts/install.sh --category migration              # one category
./scripts/install.sh --only sitecoreai-page-design-setup
./scripts/install.sh --link                            # symlink, so git pull updates in place
./scripts/install.sh --dry-run                         # show what would happen
```

On Windows, `scripts/install.ps1` takes the same options as PowerShell parameters
(`-Dest`, `-Category`, `-Only`, `-Link`, `-WhatIf`). Both scripts are idempotent — re-run either one
to update — and both refuse to overwrite a directory that is not a skill unless you pass
`--force` / `-Force`.

**`--dest` defaults to `~/.claude/skills`, which is correct only for Claude Code.** Every agent
reads a different directory:

| Agent | Personal | Project |
| --- | --- | --- |
| Claude Code | `~/.claude/skills` | `.claude/skills` |
| Codex | `~/.agents/skills` | `.agents/skills` |
| GitHub Copilot / VS Code | `~/.copilot/skills`, `~/.agents/skills` | `.github/skills`, `.claude/skills`, `.agents/skills` |

For anything else, check that client's
[integration notes](https://agentskills.io/clients) — or just use `gh skill install`, which resolves
the path for you.

### Updating a manual install

`git pull` then re-run the installer, or install once with `--link` and `git pull` alone is enough.

### Do you need a subset?

Less than you would think. Agents load only each skill's `name` and `description` at startup —
roughly 2-3k tokens for all 26 — and read a full `SKILL.md` only when a task matches. Install
everything unless you have a specific reason not to.

## How they activate

Agents load only each skill's `name` and `description` at startup, then read the full `SKILL.md`
when a task matches. You don't invoke these by name; describe the work and the relevant skill loads
itself. "Our page designs aren't applying to the Sub Page template" pulls in
`sitecoreai-page-design-setup`; "review this SitecoreAI solution's templates" pulls in
`sitecoreai-data-templates`.

`sitecoreai-migration-playbook` is the entry point for migration work — it routes to the focused
migration skills and covers which XP features have no SitecoreAI equivalent at all.

## Catalog

### Migration — Sitecore XP to SitecoreAI

| Skill | Covers |
| --- | --- |
| [`sitecoreai-migration-playbook`](skills/sitecoreai-migration-playbook/SKILL.md) | Start here. Plans and sequences a migration spanning site, templates, components, content, and code; names the XP features with no SitecoreAI equivalent. |
| [`sitecoreai-site-migration`](skills/sitecoreai-site-migration/SKILL.md) | Site and tenant definition, information architecture, navigation, routes, site settings, dictionary, redirects. |
| [`sitecoreai-template-migration`](skills/sitecoreai-template-migration/SKILL.md) | Data templates, base and branch templates, standard values, insert options, field mapping, the SXA Page + `_Designable` inheritance requirement. |
| [`sitecoreai-component-migration`](skills/sitecoreai-component-migration/SKILL.md) | XP renderings and SXA variants rebuilt as Json Renderings plus Content SDK React components, including renderings reused across mixed datasource shapes. |
| [`sitecoreai-content-migration`](skills/sitecoreai-content-migration/SKILL.md) | Page items, datasources, media, taxonomy, language versions; shared vs. per-page datasource placement; Sitecore CLI serialization. |
| [`sitecoreai-code-migration`](skills/sitecoreai-code-migration/SKILL.md) | Classifying MVC controllers, repositories, pipelines, integrations, and SPE scripts into rebuild / redesign / externalize / drop. |

### Authoring — building in SitecoreAI

| Skill | Covers |
| --- | --- |
| [`sitecoreai-page-design-setup`](skills/sitecoreai-page-design-setup/SKILL.md) | Page Designs, Partial Designs, TemplatesMapping encoding, `p:before` / `p:after` positioning, headless placeholder keys. The platform quirks that burn the most time. Useful during a migration and long after one. |

### Project review — auditing a SitecoreAI build

| Skill | Covers |
| --- | --- |
| [`sitecoreai-content-items`](skills/sitecoreai-content-items/SKILL.md) | Content hierarchy, items per node, version accumulation, broken links, validation rules, aliases and redirects. |
| [`sitecoreai-data-templates`](skills/sitecoreai-data-templates/SKILL.md) | Template naming, inheritance, duplicate fields, standard values, insert options, field sources, RTE profiles. |
| [`sitecoreai-media`](skills/sitecoreai-media/SKILL.md) | Media library storage, folder hierarchy, naming conventions, upload defaults. |
| [`sitecoreai-security`](skills/sitecoreai-security/SKILL.md) | Roles vs. per-user rights, inheritance breaking, passwords, admin accounts, upload restrictions, `SecurityDisabler`, secret storage. |
| [`sitecoreai-workflow`](skills/sitecoreai-workflow/SKILL.md) | Workflow assignment, role-gated transitions and publishing, notification volume, state count, final state. |
| [`sitecoreai-presentation-layer`](skills/sitecoreai-presentation-layer/SKILL.md) | Layout count, static vs. dynamic binding, Placeholder Settings, rendering item configuration, image parameters. |
| [`sitecoreai-solution-code`](skills/sitecoreai-solution-code/SKILL.md) | Hard-coded paths, GUIDs, media URLs, copy and language; direct database access; naming consistency; Helix-style organization. |
| [`sitecoreai-frontend-performance`](skills/sitecoreai-frontend-performance/SKILL.md) | Core Web Vitals, bundling and code splitting, script strategy, CDN, CSS, compression, caching, WCAG 2.1 AA. |
| [`sitecoreai-headless-performance`](skills/sitecoreai-headless-performance/SKILL.md) | ISR vs. SSG vs. SSR per page type, keeping personalized components out of static cache, heavy server-side work. |
| [`sitecoreai-headless-configuration`](skills/sitecoreai-headless-configuration/SKILL.md) | Connected mode, API keys and impersonation, site name, GraphQL endpoint, Edge context ID, Node and SDK versions. |
| [`sitecoreai-headless-graphql`](skills/sitecoreai-headless-graphql/SKILL.md) | Edge vs. CM endpoints, schema stitching, mutation exposure, authorization, GraphiQL, query bombs, caching. |
| [`sitecoreai-headless-editor-experience`](skills/sitecoreai-headless-editor-experience/SKILL.md) | Browser globals in SSR, libraries that break in the Pages iframe, optional layout service fields, custom error pages. |
| [`sitecoreai-headless-project-structure`](skills/sitecoreai-headless-project-structure/SKILL.md) | Component organization, router links, placeholder naming, media handling, null-safe fields, content resolvers. |
| [`sitecoreai-sxa-page-structure`](skills/sitecoreai-sxa-page-structure/SKILL.md) | Layout in Partial Designs, Available Renderings curation, placeholder restrictions, presentation off Standard Values. |
| [`sitecoreai-sxa-renderings`](skills/sitecoreai-sxa-renderings/SKILL.md) | Json vs. controller renderings, keeping Available Renderings / Placeholder Settings / `component-map` in agreement, variants, SXA modules. |
| [`sitecoreai-sxa-theming`](skills/sitecoreai-sxa-theming/SKILL.md) | Platform theme integrity, Component Styles, orphaned styles, styles folder organization. |
| [`sitecoreai-sxa-multisite`](skills/sitecoreai-sxa-multisite/SKILL.md) | Shared site as the style and design container, delegated areas, blueprint sites, authoring in the target language. |
| [`sitecoreai-sxa-datasources-media`](skills/sitecoreai-sxa-datasources-media/SKILL.md) | Datasource naming and foldering, per-page vs. shared Data locations, orphaned datasource cleanup. |
| [`sitecoreai-sxa-performance`](skills/sitecoreai-sxa-performance/SKILL.md) | Renderings per page, content testing access, CM preview caching, asset bundling in headless sites. |

## Conventions

Every skill carries the spec's required `name` and `description`, plus `license` and a `metadata`
block:

```yaml
metadata:
  display-name: "Page Design & Partial Design Setup"
  category: authoring          # migration | authoring | project-review
  tags: "page-design, partial-design, templates-mapping, headless, ..."
```

`category` and `tags` are not spec fields, so they live under `metadata`, where the spec allows
arbitrary string key-value pairs. They organize this catalog; no agent reads them. Migration skills
also declare `compatibility`, since they assume an XP source, a SitecoreAI target, and the Sitecore
CLI.

**Everything an agent matches on lives in `description`.** Agents load only `name` and `description`
at startup, so a keyword that is not in the description does not exist as far as routing is
concerned. An earlier `metadata.triggers` field listed trigger phrases that nothing ever read; those
phrases have been folded into the descriptions themselves and the field is gone. When you add a
skill, put its vocabulary in the description.

Skills stay within the spec's progressive-disclosure budget — under 500 lines and roughly 5,000
tokens — so most are a single self-contained `SKILL.md`. Detail that is genuinely optional, or
specific to one reference implementation rather than to the platform, goes in a `references/` file
the agent loads only if it needs it. `sitecoreai-migration-playbook` does this with
[its reference repo layout](skills/sitecoreai-migration-playbook/references/reference-repo-layout.md):
SKILL.md states the two-root serialization split as a rule, and the worked example with concrete
repo, site, and MCP server names sits alongside it. Skill bodies otherwise avoid naming any
particular project, so they apply to yours.

## Validation

```bash
npm run validate
```

`npm run validate` runs two checks. The first checks every skill against the specification: `name` character rules, length, and directory match;
`description` presence and the 1024-character limit; `compatibility` length; `metadata` shape;
unknown top-level frontmatter keys; the 500-line / 5,000-token progressive-disclosure budget; broken
relative file references; and duplicate names. The second checks the packaging manifests: valid
JSON, required plugin and marketplace fields, that the marketplace entry matches `plugin.json`, and
that the version agrees across `plugin.json`, `marketplace.json`, and `package.json`. Zero
dependencies, and both run on every push via [GitHub Actions](.github/workflows/validate.yml),
along with a smoke test of the installer.

## Releases

Versions are git tags, and `plugin.json` / `marketplace.json` carry the same number.

To cut a release:

1. Update `version` in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`
   (both, and keep them identical) and in `package.json`.
2. `node scripts/validate-skills.mjs`
3. Commit, then `git tag vX.Y.Z && git push --follow-tags`

Bump the minor version when skills are added or renamed, the patch version for content fixes.
Renaming or removing a skill is breaking for anyone who installed it manually — call it out in the
release notes.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Provenance

These skills were extracted from the bundled skills manager in
[kevin-buckley/vibe-sitecore](https://github.com/kevin-buckley/vibe-sitecore) and restructured to
follow [agentskills.io](https://agentskills.io) best practices, so they can be used by any
skills-compatible agent rather than only through that MCP server.

## License

[Apache-2.0](LICENSE).
