---
name: sitecoreai-headless-configuration
description: >-
  Audit SitecoreAI (formerly XM Cloud) headless and Content SDK rendering host configuration:
  connected versus disconnected mode per environment, Sitecore API key items and their CORS and
  impersonation settings, site name, GraphQL endpoint and Edge context ID, app name matching the
  registered site, Node and npm versions, and consistent versions across @sitecore-content-sdk and
  @sitecore-jss packages. Use when reviewing or auditing rendering host setup, debugging a 401
  from the layout service or an empty layout response, or when the user asks about JSS or Content
  SDK configuration and environment variables. Common phrasings: headless config review, api key
  audit, rendering host setup check, jss configuration, content sdk setup.
license: Apache-2.0
metadata:
  display-name: "Headless Configuration"
  category: project-review
  tags: "audit, configuration, api-key, environment-variables, content-sdk, jss, node"
---

# Headless Configuration

Use this skill to audit headless/Content SDK rendering host configuration in a SitecoreAI project.

## Checks

### Configured Mode
**Severity:** Major
**What to verify:** The rendering host operates in the correct mode for its environment: Connected mode (querying SitecoreAI/Experience Edge) for production, or local development mode with appropriate fallbacks.
**Issue indicators:** Production rendering host still using Disconnected/Layout Service Direct mode, or development environment hitting production Edge unnecessarily.
**Recommendation:** Ensure production builds query Experience Edge. Local development should use the local CM's layout service endpoint or a proxied Edge connection.

### API Key
**Severity:** Major
**What to verify:** A valid Sitecore API key item exists and is configured in the rendering host. The key has appropriate CORS and impersonation settings.
**Issue indicators:** Missing API key (layout service returns 401), API key with overly permissive impersonation, hardcoded API key in source code rather than environment variable.
**Recommendation:** Create a dedicated API key item per environment. Store the key in environment variables (`.env.local` for dev, deployment config for production). Set impersonation to `extranet\anonymous` for public content delivery.

### App Configuration
**Severity:** Minor
**What to verify:** The rendering host's Sitecore configuration (site name, language, GraphQL endpoint) is correctly set for each environment.
**Issue indicators:** Wrong site name causing 404s, hardcoded endpoints pointing to the wrong environment, language misconfiguration.
**Recommendation:** Use environment-specific configuration. Validate that `SITECORE_SITE_NAME`, `GRAPH_QL_ENDPOINT`, and `SITECORE_EDGE_CONTEXT_ID` are correct per deployment target.

### Configuration App Name matches the Solution
**Severity:** Minor
**What to verify:** The app name configured in the rendering host matches the JSS app registration in Sitecore (or the site name in SitecoreAI).
**Issue indicators:** Layout service returns empty layout because app name doesn't match any registered site/app.
**Recommendation:** Ensure the `SITECORE_SITE_NAME` in the rendering host environment matches the site name in SitecoreAI exactly.

### Node and NPM version
**Severity:** Minor
**What to verify:** The rendering host uses supported Node.js and NPM versions compatible with the Content SDK packages and the hosting platform.
**Issue indicators:** Build failures due to incompatible Node version, deprecated Node versions with security vulnerabilities.
**Recommendation:** Use the Node.js LTS version recommended by Sitecore Content SDK documentation. Pin the version in `.nvmrc` or `package.json` engines field.

### Sitecore NPM Packages
**Severity:** Minor
**What to verify:** All `@sitecore-content-sdk/*` (or legacy `@sitecore-jss/*`) packages are at consistent, supported versions. No mismatched versions across packages.
**Issue indicators:** Mixed package versions causing type mismatches or runtime errors, outdated packages missing security fixes or features.
**Recommendation:** Keep all Sitecore SDK packages at the same major.minor version. Update regularly and test after version bumps.

## References

- https://doc.sitecore.com/sai/en/developers/sitecoreai/getting-started-with-sitecoreai.html
- https://doc.sitecore.com/sai/en/developers/sitecoreai/deploying-sitecoreai/deploy-app/manage-an-environment/environment-variables.html
