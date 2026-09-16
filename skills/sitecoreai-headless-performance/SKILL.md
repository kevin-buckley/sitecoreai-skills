---
name: sitecoreai-headless-performance
description: >-
  Audit rendering strategy and output caching in a SitecoreAI (formerly XM Cloud) headless site:
  choosing ISR, static generation, or SSR per page type; keeping personalized components out of
  static cache; and avoiding heavy synchronous server-side work during render. Use when reviewing
  or auditing SSR and ISR strategy, high TTFB, redundant Experience Edge queries, or
  personalization that renders the same variant for every visitor. For browser-side concerns such
  as bundles, CSS, images, and Core Web Vitals, use sitecoreai-frontend-performance. Common
  phrasings: headless performance, caching review, personalization performance, ssr optimization.
license: Apache-2.0
metadata:
  display-name: "Headless Performance & Scaling"
  category: project-review
  tags: "audit, performance, isr, ssr, caching, personalization, sitecoreai"
---

# Headless Performance & Scaling

Use this skill to audit rendering host performance in a SitecoreAI SXA Headless project.

## Checks

### HTML Cache / Output Caching
**Severity:** Minor
**What to verify:** The rendering host uses appropriate caching strategies — ISR (Incremental Static Regeneration) for stable content, SSR for dynamic/personalized content, static generation where possible.
**Issue indicators:** All pages SSR'd on every request with no caching, high Time to First Byte (TTFB), redundant Edge queries on every page load.
**Recommendation:** Use Next.js ISR for content pages with a reasonable revalidation interval. Use `getStaticPaths` for known pages. Only use full SSR for pages requiring real-time personalization or user-specific content.

### Avoid caching personalized components
**Severity:** Major
**What to verify:** Components that render personalized or user-specific content are NOT served from static cache. Personalized content requires dynamic rendering.
**Issue indicators:** Personalized content showing the same variant to all users (cached), or stale personalization results.
**Recommendation:** Split pages into static and dynamic segments. Use Edge-side personalization (Sitecore Personalize/CDP) or client-side hydration for personalized components. Never ISR/SSG pages with server-side personalization.

### Avoid JavaScript Renderings (server-side)
**Severity:** Minor
**What to verify:** Components don't perform heavy server-side JavaScript computation that blocks rendering. Long-running API calls or data transformations happen asynchronously.
**Issue indicators:** Server components with synchronous external API calls causing timeouts, components fetching large datasets on every render.
**Recommendation:** Use React Server Components efficiently. Cache external API responses. Move heavy computation to build time or background jobs. Set appropriate timeouts on external API calls.

## References

- https://doc.sitecore.com/sai/en/developers/sitecoreai/environment-editing-hosts-and-rendering-hosts.html
- https://nextjs.org/docs/app/guides/incremental-static-regeneration
