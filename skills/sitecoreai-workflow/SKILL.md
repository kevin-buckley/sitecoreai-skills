---
name: sitecoreai-workflow
description: >-
  Audit SitecoreAI (formerly XM Cloud) workflow configuration: whether workflow is enabled and
  assigned through standard values, role-based restrictions on state transitions and publishing,
  email notification volume, workflow simplicity and state count, and the presence of a clear
  final publishable state. Use when reviewing or auditing content workflow or publishing
  governance in SitecoreAI, designing an approval process, or when the user asks about workflow
  states, the workbox, or who is allowed to publish to Experience Edge. Also use before publishing
  an item, or when a publish reported success but the content never reached Edge - publishing
  silently skips items not in a final workflow state. Covers the pre-publish checks: __Workflow,
  __Workflow state, the Final checkbox, Publishable From/To, and targets. Common phrasings:
  workflow audit, publishing review, item not publishing, content not on the site, publish did
  nothing, check workflow state, publishItem.
license: Apache-2.0
metadata:
  display-name: "Workflow"
  category: project-review
  tags: "audit, workflow, publishing, approvals, notifications, sitecoreai"
---

# Workflow

Use this skill to audit workflow configuration in a SitecoreAI SXA Headless project.

## Checks

### Workflow is enabled
**Severity:** Minor
**What to verify:** A content workflow is configured and assigned to content templates via Standard Values. Content goes through review before publishing.
**Issue indicators:** No workflow assigned — editors can publish immediately without review, no approval process for content changes.
**Recommendation:** Configure at least a basic Draft → Review → Approved workflow. Assign it to content template Standard Values.

### Workflow has appropriate security
**Severity:** Major
**What to verify:** Workflow state transitions are restricted by role. Only authorized roles can approve, reject, or publish content.
**Issue indicators:** All editors can execute all workflow commands, no separation between authors and approvers.
**Recommendation:** Restrict workflow commands by role: Authors can submit for review, Reviewers can approve/reject, Publishers can publish. Use workflow action security settings.

### Minimize the number of states utilizing email notification
**Severity:** Minor
**What to verify:** Email notifications are configured only for critical state transitions (submitted for review, rejected) not for every minor state change.
**Issue indicators:** Notification emails sent on every workflow state change causing notification fatigue.
**Recommendation:** Limit email notifications to actionable transitions: item needs review, item rejected. Use in-app notifications or workbox for routine transitions.

### Simplify workflows
**Severity:** Minor
**What to verify:** Workflows have the minimum number of states needed. Complex multi-stage approvals are only used when business requirements mandate them.
**Issue indicators:** Workflows with 7+ states, multiple parallel approval paths, states that items routinely skip.
**Recommendation:** Keep workflows simple: 3-4 states is typical (Draft, In Review, Approved, Published). Add complexity only when business process requires it.

### Workflow has final state
**Severity:** Minor
**What to verify:** Workflows have a clearly defined final/approved state. Items in the final state are eligible for publishing.
**Issue indicators:** Workflows with no clear terminal state, items stuck in intermediate states unable to publish.
**Recommendation:** Define a final workflow state. Configure auto-publish on reaching final state, or ensure publishers know which state indicates "ready to publish."

### Publishing restricted to specific roles
**Severity:** Major
**What to verify:** Only designated roles can trigger content publishing. Regular content editors submit work through workflow rather than publishing directly.
**Issue indicators:** All editors have publish access, content published without review, workflow bypassed via direct publish.
**Recommendation:** Restrict publish access to Publisher/Admin roles. Content editors submit through workflow. In SitecoreAI, publishing pushes to Experience Edge — restrict who can trigger this.

## Before publishing an item: check its state first

Publishing in SitecoreAI **skips** items it cannot publish rather than failing. The publish reports
success, the item never reaches Experience Edge, and nothing tells you why. Check these before
publishing, and check them again when a publish "worked" but the content is not live.

### The workflow gate

> "If an item is in a workflow, even if you have selected the Publishable check box in the
> Publishing Settings dialog box, the item isn't publishable until it reaches the final workflow
> state."

Two fields carry this, both on the item:

- `__Workflow` — which workflow the item is in. Empty means no workflow gate applies.
- `__Workflow state` — the state it currently sits in.

Being in the *last* state is not the same as being in a **final** state. "Final" is a checkbox on
the workflow state item itself. A workflow whose approved state does not have that box ticked will
accept content all the way through and still never publish anything — a common cause of "approved
content is not on the site."

Publishing a parent does not drag a non-final child along with it. Each item is gated on its own.

### The other gates

Even outside workflow, an item can be silently unpublishable:

| Gate | Where | Fails when |
| --- | --- | --- |
| Publishable | Publishing Settings, item **and** version level | Unticked on the version you expect to go live |
| Publishable From / To | Publishing Settings | Now is outside the range |
| Publishing targets | Publishing Settings, Targets tab | The target you are publishing to is excluded |
| Language version | Item | No version exists in the language being published |

Version-level beats item-level: an item marked publishable can still have the newest version marked
unpublishable, so the site keeps serving an older one.

### Pre-publish checklist

1. Read `__Workflow`. No workflow means skip to step 4.
2. Read `__Workflow state`.
3. Confirm that state's **Final** checkbox is ticked. If not, the item cannot publish, no matter
   what else is set.
4. Confirm the version you want live is marked Publishable, and that Publishable From / To includes
   now.
5. Confirm the target is not excluded on the Targets tab.
6. Confirm a version exists in the language you are publishing.
7. Publish, then verify against Experience Edge rather than trusting the publish result — query the
   Edge endpoint for the item, or load the page on the rendering host.

### Publishing programmatically

The Authoring and Management GraphQL API (`/sitecore/api/authoring/graphql/v1/`) exposes a
`publishItem` mutation, and item queries expose workflow information. Read the workflow state and
confirm the final-state gate **before** calling it — the mutation will not tell you that an item was
skipped.

The API's full schema is not enumerated in the docs; check the exact argument and return shape in
the GraphQL IDE at `/sitecore/api/authoring/graphql/playground/` for your instance before relying on
it.

## References

- https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/workflow.html
- https://doc.sitecore.com/sai/en/users/sitecoreai/manage-content/content-editor/publishing/set-up-publishing-restrictions-for-an-item.html
