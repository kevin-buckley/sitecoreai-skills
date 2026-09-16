---
name: sitecoreai-component-migration
description: >-
  Rebuild an XP rendering - SXA components, rendering variants, datasource-driven UI, and
  presentation behavior - as a SitecoreAI (formerly XM Cloud) Json Rendering plus a Content SDK
  React component. Use when migrating a component or rendering from XP to SitecoreAI, collapsing
  SXA rendering variants into React, handling one rendering reused across mixed datasource shapes,
  or deciding how a datasource template and rendering item should be recreated. For overall
  sequencing use sitecoreai-migration-playbook; for the content model use
  sitecoreai-template-migration. Common phrasings: migrate component, rendering migration, sxa
  component migration, rendering variant migration, datasource component migration.
license: Apache-2.0
compatibility: "Assumes a Sitecore XP source instance and a SitecoreAI target. Inspection steps expect an MCP server exposing the XP instance; serialization steps require the Sitecore CLI (dotnet sitecore)."
metadata:
  display-name: "Component Migration"
  category: migration
  tags: "migration, component, rendering, variants, react, content-sdk"
---

# Component Migration

Use this skill when the task is about rebuilding an XP rendering as a Content SDK component in SitecoreAI.

## Non-Negotiable Rules

1. Rebuild components for React and Content SDK. Do not port MVC views, Razor files, or SXA rendering variants line by line.
2. Rebuild datasource definitions and rendering setup in SitecoreAI. Do not copy rendering items or GUIDs directly.
3. Keep authoring shape and rendering code aligned, but do not let old implementation constraints dictate the new UI architecture.
4. Create new renderings and datasource templates in SitecoreAI via MCP tooling (authoring GraphQL or SPE remoting), not by hand-authored YAML. Use `dotnet sitecore ser pull` only to export already-created items to source control.

## Primary Goal

Turn an XP rendering into a clean SitecoreAI authoring model plus a Content SDK front-end component.

## Recommended Workflow

1. Use the XP source MCP server to inspect the rendering item, datasource template, placeholder usage, variant behavior, and page usage.
2. Document what the component does for editors and for visitors.
3. Split the task into authoring model work and rendering implementation work.
4. Rebuild the datasource template and rendering definition in SitecoreAI.
5. Implement the front-end component in the SitecoreAI rendering host using local starter patterns as reference.
6. Register the component and validate editing mode, empty data handling, layout placement, and front-end rendering.

## Content SDK Guidance

- Build components around structured datasource fields rather than old HTML fragments.
- Validate `fields?.data?.datasource`.
- Use `NoDataFallback` when data is missing.
- Use safe destructuring and Sitecore field components where applicable.
- Keep client components focused on actual interactivity.
- Register components through the normal SitecoreAI starter workflow instead of editing generated artifacts by hand.
- SXA rendering variants collapse into a single React component with variant-aware conditional rendering or separate named components.
- Handle **mixed datasource shapes** when a single rendering is reused across more than one datasource template. Common case: a shared "Page Teaser" rendering is bound to Promo-style datasources on some pages and Article-style datasources on others. Detect the shape at the top of the component (e.g. check `fields.PromoText?.value` vs `fields.Title?.value`) and branch the render tree, keeping both branches styled to visual parity. Do not force editors to create a new rendering per datasource template.
- Use `params.styles` (SXA style class multilist) as a lightweight variant switch inside a single component (e.g. `/\btile\b/i.test(params?.styles || '')`) when visual variants do not justify separate renderings.
