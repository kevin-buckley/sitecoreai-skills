# Sitecore Skills

Agent Skills for building on **Sitecore XM Cloud** — migrating from Sitecore XP, and auditing an
XM Cloud SXA Headless / Content SDK project once it exists.

26 skills, conforming to the [Agent Skills specification](https://agentskills.io/specification).
They work in any skills-compatible agent: Claude Code, Claude, Cursor, Copilot, Codex, Gemini CLI,
OpenCode, Goose, and [others](https://agentskills.io/clients).

## Install

Each skill is a self-contained directory holding a `SKILL.md`. Copy the ones you want into your
agent's skills directory, or clone the repo and symlink.

```bash
git clone https://github.com/kevin-buckley/sitecore-skills.git
```

**Claude Code** — personal (all projects) or per-project:

```bash
# all projects
cp -r sitecore-skills/skills/* ~/.claude/skills/

# just this project
mkdir -p .claude/skills && cp -r ../sitecore-skills/skills/* .claude/skills/
```

**Pick a subset.** You rarely want all 26 at once — the migration set and the audit set address
different phases of a project:

```bash
cp -r sitecore-skills/skills/sitecore-migration-playbook ~/.claude/skills/
cp -r sitecore-skills/skills/sitecore-page-design-setup  ~/.claude/skills/
```

For other agents, drop the same directories into that client's skills location — see its
[integration notes](https://agentskills.io/clients).

## How they activate

Agents load only each skill's `name` and `description` at startup, then read the full `SKILL.md`
when a task matches. You don't invoke these by name; describe the work and the relevant skill loads
itself. "Our page designs aren't applying to the Sub Page template" pulls in
`sitecore-page-design-setup`; "review this XM Cloud solution's templates" pulls in
`sitecore-data-templates`.

`sitecore-migration-playbook` is the entry point for migration work — it routes to the focused
migration skills and covers which XP features have no XM Cloud equivalent at all.

## Catalog

### Migration — Sitecore XP to XM Cloud

| Skill | Covers |
| --- | --- |
| [`sitecore-migration-playbook`](skills/sitecore-migration-playbook/SKILL.md) | Start here. Plans and sequences a migration spanning site, templates, components, content, and code; names the XP features with no XM Cloud equivalent. |
| [`sitecore-site-migration`](skills/sitecore-site-migration/SKILL.md) | Site and tenant definition, information architecture, navigation, routes, site settings, dictionary, redirects. |
| [`sitecore-template-migration`](skills/sitecore-template-migration/SKILL.md) | Data templates, base and branch templates, standard values, insert options, field mapping, the SXA Page + `_Designable` inheritance requirement. |
| [`sitecore-component-migration`](skills/sitecore-component-migration/SKILL.md) | XP renderings and SXA variants rebuilt as Json Renderings plus Content SDK React components, including renderings reused across mixed datasource shapes. |
| [`sitecore-content-migration`](skills/sitecore-content-migration/SKILL.md) | Page items, datasources, media, taxonomy, language versions; shared vs. per-page datasource placement; Sitecore CLI serialization. |
| [`sitecore-code-migration`](skills/sitecore-code-migration/SKILL.md) | Classifying MVC controllers, repositories, pipelines, integrations, and SPE scripts into rebuild / redesign / externalize / drop. |
| [`sitecore-page-design-setup`](skills/sitecore-page-design-setup/SKILL.md) | Page Designs, Partial Designs, TemplatesMapping encoding, `p:before` / `p:after` positioning, headless placeholder keys. The platform quirks that burn the most time. |

### Project review — auditing an XM Cloud build

| Skill | Covers |
| --- | --- |
| [`sitecore-content-items`](skills/sitecore-content-items/SKILL.md) | Content hierarchy, items per node, version accumulation, broken links, validation rules, aliases and redirects. |
| [`sitecore-data-templates`](skills/sitecore-data-templates/SKILL.md) | Template naming, inheritance, duplicate fields, standard values, insert options, field sources, RTE profiles. |
| [`sitecore-media`](skills/sitecore-media/SKILL.md) | Media library storage, folder hierarchy, naming conventions, upload defaults. |
| [`sitecore-security`](skills/sitecore-security/SKILL.md) | Roles vs. per-user rights, inheritance breaking, passwords, admin accounts, upload restrictions, `SecurityDisabler`, secret storage. |
| [`sitecore-workflow`](skills/sitecore-workflow/SKILL.md) | Workflow assignment, role-gated transitions and publishing, notification volume, state count, final state. |
| [`sitecore-presentation-layer`](skills/sitecore-presentation-layer/SKILL.md) | Layout count, static vs. dynamic binding, Placeholder Settings, rendering item configuration, image parameters. |
| [`sitecore-solution-code`](skills/sitecore-solution-code/SKILL.md) | Hard-coded paths, GUIDs, media URLs, copy and language; direct database access; naming consistency; Helix-style organization. |
| [`sitecore-frontend-performance`](skills/sitecore-frontend-performance/SKILL.md) | Core Web Vitals, bundling and code splitting, script strategy, CDN, CSS, compression, caching, WCAG 2.1 AA. |
| [`sitecore-headless-performance`](skills/sitecore-headless-performance/SKILL.md) | ISR vs. SSG vs. SSR per page type, keeping personalized components out of static cache, heavy server-side work. |
| [`sitecore-headless-configuration`](skills/sitecore-headless-configuration/SKILL.md) | Connected mode, API keys and impersonation, site name, GraphQL endpoint, Edge context ID, Node and SDK versions. |
| [`sitecore-headless-graphql`](skills/sitecore-headless-graphql/SKILL.md) | Edge vs. CM endpoints, schema stitching, mutation exposure, authorization, GraphiQL, query bombs, caching. |
| [`sitecore-headless-editor-experience`](skills/sitecore-headless-editor-experience/SKILL.md) | Browser globals in SSR, libraries that break in the Pages iframe, optional layout service fields, custom error pages. |
| [`sitecore-headless-project-structure`](skills/sitecore-headless-project-structure/SKILL.md) | Component organization, router links, placeholder naming, media handling, null-safe fields, content resolvers. |
| [`sitecore-sxa-page-structure`](skills/sitecore-sxa-page-structure/SKILL.md) | Layout in Partial Designs, Available Renderings curation, placeholder restrictions, presentation off Standard Values. |
| [`sitecore-sxa-renderings`](skills/sitecore-sxa-renderings/SKILL.md) | Json vs. controller renderings, keeping Available Renderings / Placeholder Settings / `component-map` in agreement, variants, SXA modules. |
| [`sitecore-sxa-theming`](skills/sitecore-sxa-theming/SKILL.md) | Platform theme integrity, Component Styles, orphaned styles, styles folder organization. |
| [`sitecore-sxa-multisite`](skills/sitecore-sxa-multisite/SKILL.md) | Shared site as the style and design container, delegated areas, blueprint sites, authoring in the target language. |
| [`sitecore-sxa-datasources-media`](skills/sitecore-sxa-datasources-media/SKILL.md) | Datasource naming and foldering, per-page vs. shared Data locations, orphaned datasource cleanup. |
| [`sitecore-sxa-performance`](skills/sitecore-sxa-performance/SKILL.md) | Renderings per page, content testing access, CM preview caching, asset bundling in headless sites. |

## Conventions

Every skill carries the spec's required `name` and `description`, plus `license` and a `metadata`
block:

```yaml
metadata:
  display-name: "Page Design & Partial Design Setup"
  category: migration          # migration | project-review
  tags: "page-design, partial-design, templates-mapping, headless, ..."
  triggers: "page design, partial design, templates mapping, ..."
```

`category`, `tags`, and `triggers` are not spec fields, so they live under `metadata` where the spec
allows arbitrary string key-value pairs. Migration skills also declare `compatibility`, since they
assume an XP source, an XM Cloud target, and the Sitecore CLI.

The migration skills describe a reference target repo layout (`xmc-local`, its two-root
serialization split, one rendering host per site). Those sections say so explicitly — adapt the
paths to your own repo and keep the underlying split, which exists because authoring items and
content items reach XM Cloud by different routes.

## Validation

```bash
node scripts/validate-skills.mjs
```

Checks every skill against the specification: `name` character rules, length, and directory match;
`description` presence and the 1024-character limit; `compatibility` length; `metadata` shape;
unknown top-level frontmatter keys; the 500-line / 5,000-token progressive-disclosure budget; broken
relative file references; and duplicate names. Zero dependencies, and it runs on every push via
[GitHub Actions](.github/workflows/validate.yml).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Provenance

These skills were extracted from the bundled skills manager in
[kevin-buckley/vibe-sitecore](https://github.com/kevin-buckley/vibe-sitecore) and restructured to
follow [agentskills.io](https://agentskills.io) best practices, so they can be used by any
skills-compatible agent rather than only through that MCP server.

## License

[Apache-2.0](LICENSE).
