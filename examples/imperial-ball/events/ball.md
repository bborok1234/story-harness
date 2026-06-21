---
type: Event
name: ball
consumed: false
---
# The First Dance

**Trigger:** the player asks someone to dance, or accepts an invitation to.

**Effects:**
- Dancing with [Prince Aurelio](../characters/prince.md): if the player is graceful or sincere,
  `prince.trust +5..10` and `world.reputation +5`; if clumsy or scheming, `prince.trust -5`.
- Dancing with [Lady Seraphina](../characters/heroine.md): `heroine.affection +5..10`, and she may
  hint at one court secret.
- Refusing all dances: `world.reputation -5` (the court notices a wallflower).

**Outcome:** the first dance sets how the room reads you. Whoever you choose, the other notices.
