---
name: sitecore-site-migration
description: >-
  Rebuild an XP site's structure - site and tenant definition, information architecture,
  navigation, routes, site settings, dictionary, and redirects - in SitecoreAI (formerly XM Cloud)
  with the Content SDK. Use when migrating a site or SXA site from XP to SitecoreAI, planning
  site-level IA or route architecture for a migration, or deciding which SXA site concepts should
  not carry over. Covers site-level structure only: use sitecore-template-migration for the
  content model, sitecore-component-migration for renderings, and sitecore-page-design-setup for
  Page Design and Partial Design wiring. Also use when creating a site or site collection in
  SitecoreAI: sites must be created through the Sites dashboard so scaffolding runs, there is no
  create-site API, and a serialized site tree must never be pushed in. Common phrasings: migrate
  site, site migration, sxa site migration, site structure migration, site settings migration, ia
  migration, create a site, create a site collection.
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

## Creating the target site

**Create the site through the Sites dashboard. Do not create it by serializing items.** This is the
single most common way to end up with a site that looks right in the content tree and behaves wrong
everywhere else.

Creating a site is not the same as creating items. The dashboard runs a scaffolding process that
assigns the site collection, installs the site's modules (available renderings, data folders,
headless variants), and wires up settings and the site definition. Hand-authoring those items, or
pushing a serialized site tree with `dotnet sitecore ser push`, skips that scaffolding entirely and
leaves you repairing the gaps by hand. A site collection is always required, and every site must
belong to one.

The instinct to serialize a site is strong on a migration, because templates, renderings, and page
designs *are* handled that way. Sites are the exception. Create the site first through the
dashboard, then serialize its items normally.

**There is no create-site API.** The Authoring and Management GraphQL API
(`/sitecore/api/authoring/graphql/v1/`) is item-level only — `createItem`, `deleteItem`,
`createItemTemplate`, `publishItem`, `uploadMedia`, `rebuildIndexes`. It has no site or
site-collection mutation, and `createItem` will not run site scaffolding. Do not confuse this with
the SitecoreAI Deploy API, which provisions *projects and environments*, a layer above sites.

For repeatable creation, in order of preference:

| Need | Use |
| --- | --- |
| A single site | The Sites dashboard |
| Many sites, or a standard shape | A **Site Template** — modules plus scaffolding, invoked from the dashboard |
| A copy of an existing site | Site duplication, or the Clone Site script |
| Scripted scaffolding | SPE: `ExecuteScript` + Headless Site Setup |

See `sitecore-sxa-multisite` for how Site Templates and the Shared site fit together across a
multi-site tenant.

## Recommended Workflow

1. Use the XP source MCP server to inspect the XP site definition, site settings, SXA assets, and page structure.
2. Record the business purpose of the site before looking at technical details.
3. Inventory the important site-level elements: site root, navigation model, page types, site settings, dictionary usage, localization, metadata, redirects, and media dependencies.
4. Identify which XP concepts are SXA-specific and should not be copied directly.
5. Design the SitecoreAI target structure in terms of authoring items plus Content SDK route rendering.
6. Create the site through the Sites dashboard (see *Creating the target site*), then rebuild its authoring model.
7. Validate URL structure, navigation, editing flow, and page composition.

## XP to SitecoreAI Guidance

- Treat SXA site setup as a source for requirements, not as a deployment artifact.
- Recreate site collections, sites, settings, and route structure intentionally in SitecoreAI — through the Sites dashboard, never by pushing a serialized site tree.
- Keep the page tree and editor experience understandable for authors.
- Move presentation responsibility into the Content SDK rendering host instead of preserving MVC or SXA rendering mechanics.
- Dictionary items in XP SXA map to SitecoreAI dictionary domain items — rebuild them in the target site's authoring tree.
- SXA Creative Exchange and theme assets do not migrate; styling is owned by the rendering host.
- Route shared chrome (header, footer, site-wide CTAs) through **Page Designs + Partial Designs** targeting the headless placeholders (`headless-header`, `headless-main`, `headless-footer`). Do not place shared renderings on each page's own Final Renderings. See the `sitecore-page-design-setup` skill for TemplatesMapping encoding, position rules (`p:before` / `p:after`), and the sub-page architecture pattern.
