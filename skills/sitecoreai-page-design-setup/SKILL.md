---
name: sitecoreai-page-design-setup
description: >-
  Wire SitecoreAI (formerly XM Cloud) Page Designs, Partial Designs, TemplatesMapping, and
  headless placeholders, including the non-obvious platform quirks that burn time: asymmetric
  TemplatesMapping URL encoding, why an empty Partial Design Signature renders nothing at all,
  why renderings placed on a Page Design's own Final Renderings never render, Available
  Renderings gating the component palette, Partial Design ordering with p:before and p:after,
  the canonical headless-header / headless-main / headless-footer placeholder keys, and the
  device ID. Use when binding a template to a page design, composing or ordering partial designs,
  positioning a rendering, building a shared sub-page architecture, or debugging a rendering that
  does not appear on the page. Common phrasings: templates mapping, headless sxa placeholder, sub
  page design, shared page design, partial design position, partial design signature, sxa- empty
  placeholder, page design final renderings.
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
- A **Partial Design** owns real renderings on its `__Renderings` field (shared, `{F1A1FE9E-A60C-4DDB-A3A0-BB5B29FE732E}`) — not `__Final Renderings`. Those renderings are what actually merge into a page's layout. It also needs a non-empty **`Signature`** (see below) or nothing it owns will render.
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
2. Place the rendering on THAT Partial Design's `__Renderings`.
3. Reference the Partial Design from the Page Design's `PartialDesigns` field (pipe-delimited multilist of GUIDs or paths, field `{0966B999-0D0E-4278-ACC9-9DA69D461FE6}`).

Only renderings reachable through the `PartialDesigns` chain are merged onto the final page.

## Gotcha: an empty Partial Design `Signature` renders nothing, silently

A Partial Design does not drop its renderings straight into the page placeholder. The merge inserts a `PartialDesignDynamicPlaceholder` into the target placeholder, and that component's renderings live in a **nested placeholder named `sxa-<Signature>`**. The signature comes from the Partial Design's `Signature` field, `{55FAAE90-3BBA-4F7F-96FE-13C3F40055FF}`.

A healthy merged layout looks like this:

```
headless-header -> PartialDesignDynamicPlaceholder  sig="sxa-header"  -> RichText, Navigation
headless-footer -> PartialDesignDynamicPlaceholder  sig="sxa-footer"  -> Container
```

If `Signature` is empty the placeholder still appears, but as `sig="sxa-"` with no children:

```
headless-main   -> PartialDesignDynamicPlaceholder  sig="sxa-"        -> (nothing)
```

The page renders its other partials fine, there is no error anywhere, and the body is simply missing. This is the same class of silent failure as the `TemplatesMapping` encoding below, and it is easy to misread as a broken rendering or a bad component registration.

When hand-authoring the item, confirm you have the right field: `Signature` is `{55FAAE90-...}`. In a serialized YAML the field immediately *after* `Signature` is usually `__Thumbnail` `{C7C26117-...}`, which is cosmetic — writing your signature into that one leaves `Signature` empty and produces exactly the failure above.

## Prefer creating Partial Designs through the Pages UI

A hand-authored Partial Design item can carry the correct template ID, a valid `Signature`, and well-formed `__Renderings` and still **not appear in the Pages "Partial designs" list**, which means editors cannot pick it and it may not participate in the merge. Creating it through **Templates → Partial designs → Create** scaffolds it correctly in one step.

The practical pattern when you are scripting a site: create the Partial Design in the UI, then pull it into serialization (`dotnet sitecore ser pull`) and hand-author its `__Renderings` from there. You get correct scaffolding and a version-controlled item.

## Renderings must be in Available Renderings to be placeable

A Json Rendering that exists under `/sitecore/layout/Renderings/...` and is registered in the rendering host's component map still will not show in the Pages component palette until its GUID is added to the site's Available Renderings item — `/<site>/Presentation/Available Renderings/<name>`, field `Renderings` `{715AE6C0-71C8-4744-AB4F-65362D20AD65}` (newline-delimited GUIDs).

Check `GET /api/editing/config?secret=<editing secret>` on the rendering host to confirm the component is registered on the front-end side; if it is listed there but still missing from the palette, the gap is Available Renderings or its publish.

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
2. **`s:Parameters` position attributes on each rendering inside the partial's `__Renderings`** control where that rendering lands relative to other renderings in the merged tree. Common values:
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

## Renderings device ID

The standard device GUID used in `__Renderings` / `__Final Renderings` XML for Headless pages:

```
{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}
```

All rendering `<d>` elements on SitecoreAI Headless SXA sites use this device ID. If you are generating that XML programmatically, hardcode this.

A minimal, working Partial Design `__Renderings` value:

```xml
<r xmlns:p="p" xmlns:s="s" p:p="1">
  <d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}">
    <r uid="{YOUR-UNIQUE-UID}"
       s:id="{RENDERING-ITEM-ID}"
       s:ds="{DATASOURCE-ID-OR-local:/Data/Thing}"
       s:par=""
       s:ph="headless-main" />
  </d>
</r>
```

Note `s:ph` names the *page* placeholder (`headless-main`), not the `sxa-<signature>` one — the merge does that rewrite for you.

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
4. When a rendering does not appear on the page, query the merged layout and read the `sig` values before touching anything — it tells you which of the checks below to run. Then check in this order: (a) is it on a Partial Design, not the Page Design itself? (b) does that Partial Design have a non-empty `Signature` (is `sig` `sxa-` in the merged layout)? (c) is that Partial Design listed in `PartialDesigns`, and does the merged `sid` actually match the one you expect? (d) is `TemplatesMapping` encoded correctly? (e) does the rendering target a real headless placeholder key? (f) is the rendering in Available Renderings?
5. When position is wrong, adjust `p:before` / `p:after` on the rendering in the partial, not the partial order in `PartialDesigns`, for fine-grained control within a single placeholder.

Query the merged layout straight from Edge rather than guessing from the editor:

```
POST <edge-platform host>/v1/content/api/graphql/v1
  host:   edge-platform.sitecorecloud.io
  header: x-sitecore-contextid: <preview or live context id>

query { layout(site:"<site>", routePath:"/Some/Page", language:"en") { item { rendered } } }
```

Query both context ids. Preview and live are **different** ids and can disagree — a route that resolves under live and returns `null` under preview will 404 on the editing host, which renders against preview.

`sitecore.context.pageDesign.name` tells you whether `TemplatesMapping` resolved; the `placeholders` tree with each component's `params.sid` / `params.sig` tells you whether the partials merged.

## Known issue: a stale merged layout survives publish

Changing a Page Design's `PartialDesigns` field does not reliably re-merge already-published pages. Symptom: the merged layout keeps returning the **old** partial's `sid` even though the CM holds the new value and `ser push`, `publish` and `publish --republish` all report success. Page items themselves are unchanged, so nothing invalidates their cached merge.

If you hit this, verify the CM value first (`ser push --what-if` reporting no change for that item means the CM matches your file), then treat it as a propagation problem rather than re-editing the design. Re-assigning the page design through the Pages UI, or touching the page items so they republish, are the levers worth trying before assuming the mapping is wrong.

## Creating page items by script: set the workflow state

A page template usually carries `__Default workflow` on its Standard Values. Items created by serialization push land in that workflow's **initial** state (commonly Basic Workflow → Draft) and will silently refuse to publish.

Set `__Workflow state` `{3E431DE1-525E-47A3-B6B0-1CCBEC3A8C98}` explicitly on each new page version to the approved state used by the site's existing pages — read it off a working page rather than assuming. Basic Workflow `{B4F49B23-...}` uses Draft `{57CC7DCE-...}` → Approved `{F7FE5BDD-...}`. See `sitecoreai-workflow` for the governance side.

## Out-of-Scope

- SXA (XP) Page Designs use a different authoring model; do not transplant XP SXA design items into SitecoreAI. Rebuild.
- Traditional MVC layout items and `__Renderings` / `__Final Renderings` on regular Page items still exist in SitecoreAI but should not be used for shared chrome — always route shared presentation through Page Designs + Partial Designs.
