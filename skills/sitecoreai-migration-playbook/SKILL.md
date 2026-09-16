---
name: sitecoreai-migration-playbook
description: >-
  Plan and coordinate an end-to-end Sitecore XP to SitecoreAI (formerly XM Cloud) migration. Use
  when starting, scoping, sequencing, or coordinating a migration that spans more than one area -
  site structure, templates, components, content, and code - or when the user asks for a migration
  plan, strategy, playbook, or overview. Start here and use it to decide which focused skill
  applies next: sitecoreai-site-migration, sitecoreai-template-migration,
  sitecoreai-component-migration, sitecoreai-content-migration, sitecoreai-code-migration, or
  sitecoreai-page-design-setup. Also use when the question is which XP features (xConnect, Sitecore
  Forms, marketing automation, Content Hub, federated auth) have no SitecoreAI equivalent. Not for
  auditing an existing SitecoreAI build. Common phrasings: migration playbook, xp to sitecoreai
  migration, xp to xm cloud migration, migration overview, migration strategy.
license: Apache-2.0
compatibility: "Assumes a Sitecore XP source instance and a SitecoreAI target. Inspection steps expect an MCP server exposing the XP instance; serialization steps require the Sitecore CLI (dotnet sitecore)."
metadata:
  display-name: "Migration Playbook"
  category: migration
  tags: "migration, playbook, overview, planning, sitecore, sitecoreai"
---

# Migration Playbook

Use this skill first when the task spans multiple migration areas or when you need an overall XP to SitecoreAI migration plan.

## Environment Mapping

Establish the source and target up front and record all four roles, so every later step has
something concrete to point at:

- **XP source environment** — the MCP server and CM hostname exposing the XP instance.
- **SitecoreAI target environment** — the MCP server and CM hostname for the target.
- **XP source project** — the solution being migrated from.
- **SitecoreAI target project** — the repo being migrated into.

For a fully worked example of these four roles, see
[references/reference-repo-layout.md](references/reference-repo-layout.md).

## Out-of-Scope XP Features

These XP platform features have no direct SitecoreAI equivalent and must be evaluated separately:
- **Content Hub (DAM)**: XP references Sitecore Content Hub assets. SitecoreAI has a separate Content Hub connector — do not assume assets migrate automatically.
- **xConnect / Personalization**: xConnect behavioral data and rule-based personalization do not exist in SitecoreAI. Evaluate Sitecore CDP or drop.
- **Sitecore Forms**: No direct equivalent. Evaluate SitecoreAI Forms, third-party form providers, or rebuild.
- **Marketing Automation**: Campaigns, goals, and engagement plans have no SitecoreAI equivalent. Evaluate Sitecore Send or drop.
- **Federated Authentication**: Facebook/Microsoft auth in XP is replaced by Okta/identity provider config in SitecoreAI.

## Serialization: the two-root deploy split

Authoring items and content items reach SitecoreAI by **different routes**, so keep them in
separate Sitecore CLI serialization roots:

- **Authoring root** — templates, renderings, page designs, partial designs, SPE scripts. These
  ship as Items-as-Resources through the build (IAR-via-deploy). Do **not** `ser push` them.
- **Content root** — content items and media. Pushed manually with `dotnet sitecore ser push`.

Adopt this split, or map the two roles onto whatever the project already uses. The split matters
more than the paths. A worked example of the root layout, per-site module naming, and rendering
host placement is in
[references/reference-repo-layout.md](references/reference-repo-layout.md).

## Non-Negotiable Rules

1. Rebuild, do not clone.
2. Do not copy Sitecore XP items, packages, serialized trees, or GUIDs straight into SitecoreAI.
3. Migrate business behavior and editor outcomes, not SXA or MVC implementation details.
4. Separate authoring structure, rendering host code, integration code, and migration-only utilities.
5. Prefer small verified increments over one-shot migration attempts.

## Standard Workflow

1. Inspect the current XP implementation through the XP source MCP server.
2. Identify what the feature does for editors, visitors, and downstream integrations.
3. Classify the work into site structure, templates, components, content, and code.
4. Define the SitecoreAI target model in authoring terms before writing rendering code.
5. Rebuild the rendering host behavior against the new model using Content SDK patterns.
6. Migrate or recreate content only after the target model is stable.
7. Validate URLs, editing workflows, component behavior, integrations, and acceptance criteria.
8. Verify visual parity against the XP reference for every rebuilt page and component. Fetch the XP page HTML or screenshot through the XP source MCP server and compare to the SitecoreAI rendering host output. Styling drift (button shape, eyebrow labels, card-over-image overlap, nav dropdown geometry) will not surface in type checks or test suites — a side-by-side visual compare is the only reliable check.

## Which Focused Skill To Use Next

- `sitecoreai-site-migration` for site definition, IA, navigation, and route architecture.
- `sitecoreai-template-migration` for content model and field mapping.
- `sitecoreai-component-migration` for renderings, variants, and datasource-driven UI.
- `sitecoreai-content-migration` for pages, datasource items, media, taxonomy, and cleanup rules.
- `sitecoreai-code-migration` for MVC code, pipelines, integrations, scripts, and front-end behavior.
- `sitecoreai-page-design-setup` for Page Designs, Partial Designs, TemplatesMapping binding, and headless placeholder wiring.

## What To Capture

- source items, templates, renderings, and code locations
- target SitecoreAI design decisions and accepted deviations
- old-to-new mappings for fields, routes, components, and data flows
- blockers, redesign decisions, and parity criteria

## Exit Criteria

The migration is ready to move forward when the target structure, mappings, and acceptance criteria are explicit enough that implementation can proceed without guessing.
