# Reference Repo Layout

A concrete worked example of the two-root serialization split described in `SKILL.md`. These are
the names used by one reference implementation — **substitute your own project's repo, site, and
MCP server names**. The *split* is what carries over, not the paths.

## Environment mapping

Record all four roles up front so later steps have something concrete to point at:

| Role | Example |
| --- | --- |
| XP source environment | MCP server `sitecore-lighthouse-xp` -> `https://cm.lighthouse.localhost/` |
| SitecoreAI target environment | MCP server `sitecore-xmcloud-cm-local` -> `https://xmcloudcm.localhost/` |
| XP source project | `Sitecore.Demo.Platform` |
| SitecoreAI target project | `xmc-local` |

## Two-root deploy split

The repo splits Sitecore serialization across two CLI roots because authoring items and content
items reach SitecoreAI by different routes:

- **`sitecore.json` (repo root)** — reads modules from `authoring/items/**/*.module.json`. Owns
  templates, renderings, page designs, partial designs, and SPE scripts. These ship to SitecoreAI as
  **Items-as-Resources via the build** (IAR-via-deploy). Do not `ser push` these; the build deploys
  them.
- **`content-push/sitecore.json`** — reads modules from `../content/**/*.module.json`. Owns content
  items and media. Pushed manually with `dotnet sitecore ser push` from the `content-push/`
  directory.

## Per-site module naming

| Module | Owns |
| --- | --- |
| `<site>.module.json` | site authoring (templates, renderings, page designs) |
| `<site>-global.module.json` | global / shared authoring |
| `<site>-spe.module.json` | SPE scripts |
| `<site>-content.module.json` | site content + media |
| `<site>-global-content.module.json` | shared content + media |

## Rendering hosts and working documents

One Next.js rendering host per site under `examples/<site-name>/`. Per-site migration plans and
audits live at repo root as `PLAN-<site>.md` and `AUDIT-<site>.md`.
