---
name: sitecoreai-code-migration
description: >-
  Classify and rebuild Sitecore XP implementation code - MVC controllers and views, repositories,
  pipelines, event handlers, integrations, SPE scripts, and front-end behavior - for SitecoreAI
  (formerly XM Cloud) and the Content SDK rendering host. Use when migrating code from XP to
  SitecoreAI or Next.js, deciding whether a piece of XP code should be rebuilt, redesigned,
  externalized, or dropped, or laying out a multi-site rendering host. Also use when asked what
  becomes of xConnect, Sitecore Forms, marketing automation, or federated auth code. For rendering
  items and datasource templates use sitecoreai-component-migration. Common phrasings: migrate code,
  code migration, mvc to content sdk, xp to next.js, rendering host migration, pipeline migration.
license: Apache-2.0
compatibility: "Assumes a Sitecore XP source instance and a SitecoreAI target. Inspection steps expect an MCP server exposing the XP instance; serialization steps require the Sitecore CLI (dotnet sitecore)."
metadata:
  display-name: "Code Migration"
  category: migration
  tags: "migration, code, mvc, pipelines, integrations, nextjs, content-sdk"
---

# Code Migration

Use this skill when the task is about moving implementation logic from the XP solution into the SitecoreAI rendering host and supporting services.

## Code Classification

Classify each piece of XP code before deciding what to do with it:
- **Presentation logic** (MVC controllers + .cshtml views) → rebuild as React server components using `@sitecore-content-sdk/nextjs`
- **Data access / repositories** → replace with GraphQL Edge queries via Content SDK
- **Content Hub integration** → evaluate SitecoreAI's Content Hub connector; do not port XP DAM integration code directly
- **xConnect / personalization** → no SitecoreAI equivalent; evaluate Sitecore CDP or drop entirely
- **Sitecore Forms** → evaluate SitecoreAI Forms, a third-party form provider, or rebuild; do not port ASP.NET Forms pipeline code
- **Marketing automation** (campaigns, goals, engagement plans) → no SitecoreAI equivalent; evaluate Sitecore Send or drop
- **SPE (PowerShell) scripts** → migration utilities only; do not port operational scripts that depend on XP-specific APIs
- **Pipelines and events** → evaluate whether the behavior is still needed; rebuild as middleware or API routes if so
- **Federated auth** → handled by identity provider config in SitecoreAI, not application code

## Non-Negotiable Rules

1. Do not copy XP code blindly into the new solution.
2. Do not preserve MVC, pipeline, or SXA implementation patterns that do not belong in a headless SitecoreAI architecture.
3. Rebuild code around supported SitecoreAI and Content SDK patterns.

## Primary Goal

Classify old code correctly and rebuild it in the right place: SitecoreAI authoring items, the Content SDK rendering host, an external service or integration layer, or a migration-only utility.

## Recommended Workflow

1. Inspect the XP code and classify each behavior as presentation logic, data access logic, integration logic, editor tooling, or pipeline and event behavior.
2. Decide whether the behavior should be rebuilt, redesigned, externalized, or dropped.
3. Rebuild front-end rendering behavior in the SitecoreAI rendering host using local starter patterns.
4. Replace Sitecore runtime dependencies with headless-compatible APIs and service boundaries where needed.
5. Validate the rebuilt code against actual SitecoreAI authoring data.

## Rendering Host Layout (Multi-Site)

Host one Next.js rendering host per migrated site, in its own directory under a shared examples or apps root (`<root>/<site-name>/`). Use whatever per-site directory convention the project already has; the rule that carries over is that each site gets its own isolated host.

- New site code goes in a new `examples/<site-name>/` folder, scaffolded from the Content SDK starter, not added to an existing site.
- Shared cross-site utilities, if needed, belong outside `examples/` so they can be imported by any site without coupling sites to each other.
- The site's components, styles, and middleware live entirely inside its own `examples/<site-name>/` folder. Do not reach into a sibling site to reuse a component — copy it or extract a shared package.

## Content SDK Guidance

- Prefer server components for data-driven rendering unless interactivity requires client code.
- Use `@sitecore-content-sdk/nextjs` field components and local helper patterns from the rendering host.
- Keep the rendering host aligned with the rebuilt authoring model instead of compensating for legacy XP assumptions.
- Keep integrations and business logic outside presentation components when possible.
- Do not port SXA Creative Exchange themes or SCSS; use the rendering host's styling approach.
