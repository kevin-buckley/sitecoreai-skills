---
name: sitecore-template-migration
description: >-
  Rebuild an XP content model - data templates, base templates, branch templates, standard values,
  insert options, and field types - as SitecoreAI (formerly XM Cloud) templates. Use when
  migrating or mapping templates and fields from XP to SitecoreAI, deciding which legacy fields to
  drop, or making page templates inherit from both SXA Page and _Designable. Also use when the
  user asks about field mapping, standard values migration, or creating templates through MCP
  tooling and the authoring UI rather than hand-authored YAML. For auditing templates in an
  existing SitecoreAI project rather than migrating into one, use sitecore-data-templates. Common
  phrasings: migrate template, template migration, branch template migration, data template
  migration.
license: Apache-2.0
compatibility: "Assumes a Sitecore XP source instance and a SitecoreAI target. Inspection steps expect an MCP server exposing the XP instance; serialization steps require the Sitecore CLI (dotnet sitecore)."
metadata:
  display-name: "Template Migration"
  category: migration
  tags: "migration, template, content-model, fields, sitecore, sitecoreai"
---

# Template Migration

Use this skill when the task is about rebuilding the XP content model in SitecoreAI.

## Non-Negotiable Rules

1. Rebuild templates in SitecoreAI. Do not copy XP templates and GUIDs directly into the target instance.
2. Do not preserve field clutter just because it exists in XP.
3. Design templates around the new authoring model and the needs of the Content SDK rendering layer.
4. Create new templates, sections, fields, standard values, and insert options in SitecoreAI via MCP tooling (authoring GraphQL or SPE remoting via `run-powershell-script`) or the authoring UI, not by hand-authored YAML. Use `dotnet sitecore ser pull` only to export already-created items to source control. Hand-authoring template YAML is a fast way to produce items that load with broken field types, missing source values, or wrong base templates.
5. **Page templates must inherit from both `SXA Page` `{3F8A6A5D-7B1A-4566-8CD4-0A50F3030BD8}` and `_Designable` `{6650FB34-7EA1-4245-A919-5CC0F002A6D7}`.** SXA Page is the marker that SXA-aware tooling looks for (the upstream "Download Export Structure" script and any other `DoesTemplateInheritFrom(Page.ID)` check); `_Designable` adds the `Page Design` field that participates in TemplatesMapping. Add both bases on the project's root page template — SXA Page defines zero fields, so it cascades to every descendant page template with no field collisions. Sites scaffolded outside the SXA Headless Site Branch Template (older demo and starter solutions) typically inherit only from `_Designable`; that renders fine but breaks every external tool that walks site structure.

## Primary Goal

Translate the XP content model into a clean SitecoreAI template model that supports the target editing and rendering experience.

## Recommended Workflow

1. Use the XP source MCP server to inspect templates, base templates, standard values, insert options, branch templates, and real field usage.
2. Identify which fields are actually used by pages, renderings, and business workflows.
3. Remove legacy or SXA-only technical fields that do not belong in the new solution.
4. Drop fields that supported xConnect personalization, marketing automation, or Sitecore Forms — these do not have equivalents in SitecoreAI.
5. Define the target template structure in SitecoreAI: base templates, content templates, datasource templates, page templates, and branch templates only where they still help editors.
6. Create the templates in SitecoreAI via MCP tooling or the authoring UI, then `dotnet sitecore ser pull -i "<site>"` to commit the generated YAML under `authoring/items/`.
7. Rebuild standard values and insert options in the target model via MCP/UI (not YAML).
8. Document old-to-new field mappings before moving content.

## Content SDK Considerations

- Favor field types that map cleanly to Content SDK components such as text, rich text, image, and link fields.
- Support predictable `fields.data.datasource` access patterns in components.
- Keep datasource templates focused and small where possible.
- Make sure the data model supports safe rendering even when optional fields are empty.
- Content Hub asset picker fields from XP do not exist in SitecoreAI. Replace with standard Image or File fields backed by SitecoreAI's Media Library or a Content Hub connector.
