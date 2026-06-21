---
type: Event
name: engagement
consumed: false
---
# A Whispered Proposal

**Trigger:** fires only after `prince.trust ≥ 60` — the Prince draws the player aside and proposes a
political betrothal to secure an ally against the Duke.

**Effects:**
- Accept: `prince.trust +10`, `prince.affection +10`, `world.reputation +15`, but the Duke's faction
  now marks the player as an enemy (add a new event/threat).
- Decline gently: `prince.trust -5` but `prince.affection +5` (he respects honesty).
- Decline coldly: `prince.trust -15`.

**Outcome:** the proposal forces the player off the fence. Whatever they choose reshapes the board.
