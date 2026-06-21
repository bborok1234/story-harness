---
type: Event
title: Events
---
# Events

One file per event that can fire in a scene. Frontmatter `type: Event`. Listed under a scene's
**Available events** become triggerable; mark `consumed: true` once they fire.

```markdown
---
type: Event
name: <event>
consumed: false
---
# <Event>
Trigger: what the player does to fire it.
Effects: state/relationship changes it causes.
Outcome: how the world shifts.
```

## Catalog
- (add event files here)
