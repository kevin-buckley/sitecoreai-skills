---
name: sitecore-sxa-theming
description: >-
  Audit SXA theming in a SitecoreAI (formerly XM Cloud) headless site: never modifying
  out-of-the-box platform themes, defining Component Styles so editors get visual variations
  without resorting to custom classes in rendering parameters or rich text, removing orphaned
  style items, and organizing styles into sub-folders by purpose. Use when reviewing or auditing a
  site's Styles folder, themes, or component style options. For front-end CSS delivery, bundling,
  and unused CSS shipped to the browser, use sitecore-frontend-performance. Common phrasings:
  theme audit, sxa styles review, css organization check, platform theme modifications.
license: Apache-2.0
metadata:
  display-name: "SXA Theming"
  category: project-review
  tags: "audit, sxa, themes, styles, component-styles, css"
---

# SXA Theming

Use this skill to audit SXA theming practices in a SitecoreAI SXA Headless project.

## Checks

### Do not modify platform themes
**Severity:** Major
**What to verify:** No modifications to OOTB SXA platform themes or base themes. Custom styling is done in project-specific themes only.
**Issue indicators:** Modified items under SXA's system theme folders, changes that will be lost on platform updates.
**Recommendation:** Create a custom theme for your site. Inherit from or reference platform themes without modifying them directly.

### Assign custom styles to components
**Severity:** Minor
**What to verify:** Custom CSS class options (Component Styles) are configured and available to editors for visual variations (e.g., "dark background", "centered", "full-width").
**Issue indicators:** No component styles defined — editors resort to custom CSS classes in rendering parameters or Rich Text markup. Or editors have no way to apply visual variations.
**Recommendation:** Define Component Style items under the site's Styles folder. Group them logically by purpose (layout, color, spacing).

### Clean your styles folder of unused styles
**Severity:** Minor
**What to verify:** The site's Styles folder does not contain orphaned or unused style items that clutter the editor interface.
**Issue indicators:** Dozens of style items that no component uses, leftover styles from deprecated features.
**Recommendation:** Periodically audit styles. Remove items that are not referenced by any active rendering or component configuration.

### Place style items in sub-folders of your site's Styles folder
**Severity:** Minor
**What to verify:** Style items are organized in sub-folders by purpose or component, not dumped flat in the root Styles folder.
**Issue indicators:** Flat list of 50+ style items with no folder organization, making maintenance difficult.
**Recommendation:** Organize styles into sub-folders: `Styles/Layout/`, `Styles/Colors/`, `Styles/Components/<ComponentName>/`.

## References

- https://doc.sitecore.com/xmc/en/developers/xm-cloud/themes.html
- https://doc.sitecore.com/xmc/en/developers/xm-cloud/styles.html
