---
name: sitecore-site-migration
description: >-
  Rebuild an XP site's structure - site and tenant definition, information architecture,
  navigation, routes, site settings, dictionary, and redirects - in SitecoreAI (formerly XM Cloud)
  with the Content SDK. Use when migrating a site or SXA site from XP to SitecoreAI, planning
  site-level IA or route architecture for a migration, or deciding which SXA site concepts should
  not carry over. Covers site-level structure only: use sitecore-template-migration for the
  content model, sitecore-component-migration for renderings, and sitecore-page-design-setup for
  Page Design and Partial Design wiring. Common phrasings: migrate site, site migration, sxa site
  migration, site structure migration, site settings migration, ia migration.
license: Apache-2.0
compatibility: "Assumes a Sitecore XP source instance and a SitecoreAI target. Inspection steps expect an MCP server exposing the XP instance; serialization steps require the Sitecore CLI (dotnet sitecore)."
metadata:
  display-name: "Site Migration"
  category: migration
  tags: "migration, site, sxa, sitecore, sitecoreai, navigation, ia"
---

# Site Migration

Use this skill when the task is about moving site-level structure from XP into SitecoreAI.

## Non-Negotiable Rules

1. Rebuild the site structure in SitecoreAI. Do not copy XP site items or GUIDs into the target instance.
2. Do not force one-to-one parity with SXA if SitecoreAI and Content SDK support a cleaner approach.
3. Preserve business behavior, URL intent, and editor outcomes. Do not preserve legacy implementation debt without a reason.

## Primary Goal

Define how an XP site should exist in SitecoreAI across authoring structure, site configuration, page architecture, navigation, and rendering host responsibilities.

## Recommended Workflow

1. Use the XP source MCP server to inspect the XP site definition, site settings, SXA assets, and page structure.
2. Record the business purpose of the site before looking at technical details.
3. Inventory the important site-level elements: site root, navigation model, page types, site settings, dictionary usage, localization, metadata, redirects, and media dependencies.
4. Identify which XP concepts are SXA-specific and should not be copied directly.
5. Design the SitecoreAI target structure in terms of authoring items plus Content SDK route rendering.
6. Rebuild the site manually in the SitecoreAI authoring model.
7. Validate URL structure, navigation, editing flow, and page composition.

## XP to SitecoreAI Guidance

- Treat SXA site setup as a source for requirements, not as a deployment artifact.
- Recreate site collections, sites, settings, and route structure intentionally in SitecoreAI.
- Keep the page tree and editor experience understandable for authors.
- Move presentation responsibility into the Content SDK rendering host instead of preserving MVC or SXA rendering mechanics.
- Dictionary items in XP SXA map to SitecoreAI dictionary domain items — rebuild them in the target site's authoring tree.
- SXA Creative Exchange and theme assets do not migrate; styling is owned by the rendering host.
- Route shared chrome (header, footer, site-wide CTAs) through **Page Designs + Partial Designs** targeting the headless placeholders (`headless-header`, `headless-main`, `headless-footer`). Do not place shared renderings on each page's own Final Renderings. See the `sitecore-page-design-setup` skill for TemplatesMapping encoding, position rules (`p:before` / `p:after`), and the sub-page architecture pattern.
