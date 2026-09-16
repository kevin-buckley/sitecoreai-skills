---
name: sitecoreai-page-design-setup
description: >-
  Wire SitecoreAI (formerly XM Cloud) Page Designs, Partial Designs, TemplatesMapping, and
  headless placeholders, including the non-obvious platform quirks that burn time: asymmetric
  TemplatesMapping URL encoding, why renderings placed on a Page Design's own Final Renderings
  never render, Partial Design ordering with p:before and p:after, the canonical headless-header /
  headless-main / headless-footer placeholder keys, and the Final Renderings device ID. Use when
  binding a template to a page design, composing or ordering partial designs, positioning a
  rendering, building a shared sub-page architecture, or debugging a rendering that does not
  appear on the page. Common phrasings: templates mapping, headless sxa placeholder, sub page
  design, shared page design, partial design position, page design final renderings.
license: Apache-2.0
metadata:
  display-name: "Page Design & Partial Design Setup"
  category: authoring
  tags: "page-design, partial-design, templates-mapping, headless, placeholders, sitecoreai, sxa-headless"
---

# Page Design & Partial Design Setup

Use this skill when binding templates to Page Designs, composing Partial Designs, or positioning renderings in a Headless SXA site. These are the non-obvious SitecoreAI platform behaviors that repeatedly burn time.

## Mental Model

- A **Page Design** is a composition item that picks up presentation from one or more **Partial Designs** via its `PartialDesigns` multilist field. Editors do NOT drop renderings onto the Page Design itself.
- A **Partial Design** owns real renderings on its `__Final Renderings` field. Those renderings are what actually merge into a page's layout.
- A **template** is bound to a Page Design via the Page Designs folder's `TemplatesMapping` field (see encoding below). Every page derived from that template inherits the design.
- A **Sub Page template** plus a single SubPage Page Design is the standard pattern for a family of pages that share chrome but diverge in body content.

## Prerequisite: page template inheritance

The whole Page Design + Partial Design + TemplatesMapping system only resolves if the page template inherits from the right SXA bases. Required:

- **SXA Page** `{3F8A6A5D-7B1A-4566-8CD4-0A50F3030BD8}` — the marker base SXA-aware tooling checks (`DoesTemplateInheritFrom(Page.ID)`). External pipelines like the Sitecore AI Pathway "Download Export Structure" script enumerate site pages by this check.
- **_Designable** `{6650FB34-7EA1-4245-A919-5CC0F002A6D7}` — adds the `Page Design` field on every page item; without it, TemplatesMapping has nothing to bind to per-item.

SXA Headless Site Branch Template-scaffolded sites satisfy this automatically. Bespoke or migrated sites — e.g. a legacy `Pages/Page` template inheriting only from `_Designable + Standard Template` — need SXA Page added as a base on the project root page template. SXA Page itself defines zero fields, so adding it as an additional base cascades to all descendants with no field collisions. See `sitecoreai-template-migration` / `sitecoreai-data-templates` skill for the audit rule.

## Gotcha: Renderings on a Page Design's own Final Renderings do NOT render

If you place a rendering directly on the Page Design item's `__Final Renderings`, it will not appear on pages that use the design. The Page Design is a composition item — its own Final Renderings are ignored at merge time.

**Correct pattern:**

1. Create a Partial Design item under the site's `/Presentation/Partial Designs` folder.
2. Place the rendering on THAT Partial Design's `__Final Renderings`.
3. Reference the Partial Design from the Page Design's `PartialDesigns` field (pipe-delimited multilist of GUIDs or paths).

Only renderings reachable through the `PartialDesigns` chain are merged onto the final page.

## TemplatesMapping encoding (asymmetric double-encoding)

The `TemplatesMapping` field on a Page Designs folder item binds templates to designs. The encoding is not symmetric and is the single most common foot-gun when scripting this.

**Rules:**
- Template ID (name side): braces **single-encoded** → `%7b` and `%7d`
- Page Design ID (value side): braces **double-encoded** → `%257B` and `%257D`
- Name/value separator: `%3d` (=)
- Pair separator: `%26` (&)

**Skeleton:**

```
%7bTEMPLATE-ID-1%7d%3d%257BDESIGN-ID-1%257D%26%7bTEMPLATE-ID-2%7d%3d%257BDESIGN-ID-2%257D
```

Using the same encoding on both sides (e.g. `%7b...%7d` on the value) silently fails at mapping resolution — pages render with no design applied and no explicit error. When in doubt, read an existing working `TemplatesMapping` from another Page Designs folder and mimic its encoding exactly.

## Partial Design ordering and rendering position rules

Two independent levers control where a Partial Design's renderings land on the merged page:

1. **Order of GUIDs in the Page Design's `PartialDesigns` field** controls the default relative ordering of each partial's contributions.
2. **`s:Parameters` position attributes on each rendering inside the partial's Final Renderings** control where that rendering lands relative to other renderings in the merged tree. Common values:
   - `p:before="*"` — place this rendering before all other renderings in the same placeholder
   - `p:after="*"` — place this rendering after all other renderings in the same placeholder
   - `p:after="r[@uid='{RENDERING-UID}']"` — place this rendering immediately after a specific rendering from another partial
   - `p:before="r[@uid='{RENDERING-UID}']"` — place this rendering immediately before a specific rendering

Use `p:before="*"` on a footer-placed rendering when you need content (e.g. a Subscribe CTA) to appear at the very top of the footer region — above the footer carousel and footer itself.

## Headless SXA canonical placeholder keys

Headless SXA pages expose three canonical top-level placeholders. Target these from Partial Design renderings:

- `headless-header` — site header, utility nav, primary nav
- `headless-main` — page body content (Title, Rich Text, Promo, Page Teaser, etc.)
- `headless-footer` — footer carousel, footer, and any site-wide CTAs that should render below the main body

A rendering lands in `headless-main` by default; to pin a rendering to the footer region, set its placeholder to `headless-footer` and use `p:before="*"` to position it above the default footer content.

## Final Renderings device ID

The standard device GUID used in `__Final Renderings` XML for Headless pages:

```
{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}
```

All rendering `<d>` elements on SitecoreAI Headless SXA sites use this device ID. If you are generating Final Renderings XML programmatically, hardcode this.

## Shared sub-page architecture pattern

For a family of pages (e.g. `/at-home/healthy-eating`, `/at-home/sleep-technology`, `/at-work/corporate-wellness`) that share chrome and structure but diverge in body content, use this pattern:

1. **One Sub Page template** inheriting from the site's base Page template.
2. **One SubPage Page Design** bound to that template via `TemplatesMapping`.
3. **Multiple Partial Designs** referenced by the SubPage Page Design in the correct order, for example: `Header | Subscribe CTA | Footer`.
4. **Shared datasources** (e.g. a global Subscribe CTA item) live under `/sitecore/content/<site>/Data/Shared/` and are referenced by renderings in a shared Partial Design.
5. **Per-page local datasources** live under each page's own `./Data/` folder: `./Data/Title`, `./Data/Body`, `./Data/Feature Promo`. The page's Final Renderings XML wires those local datasources to the renderings that need them.

This keeps chrome (header, footer, shared CTAs) in one editable location while allowing each sub-page's body content to be authored independently.

## Recommended Workflow

1. Inspect an existing working Page Design and its `TemplatesMapping` value before authoring new ones — the encoding pattern is hard to remember from scratch.
2. Sketch the `PartialDesigns` chain (header, body partials, footer) before creating items.
3. Create Partial Designs first, then the Page Design, then the `TemplatesMapping` binding last.
4. When a rendering does not appear on the page, check in this order: (a) is it on a Partial Design, not the Page Design itself? (b) is that Partial Design listed in `PartialDesigns`? (c) is `TemplatesMapping` encoded correctly? (d) does the rendering target a real headless placeholder key?
5. When position is wrong, adjust `p:before` / `p:after` on the rendering in the partial, not the partial order in `PartialDesigns`, for fine-grained control within a single placeholder.

## Out-of-Scope

- SXA (XP) Page Designs use a different authoring model; do not transplant XP SXA design items into SitecoreAI. Rebuild.
- Traditional MVC layout items and `__Renderings` / `__Final Renderings` on regular Page items still exist in SitecoreAI but should not be used for shared chrome — always route shared presentation through Page Designs + Partial Designs.
