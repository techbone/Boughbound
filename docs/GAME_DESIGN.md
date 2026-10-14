# Boughbound — game design

**Every branch is a chance.**

One sentence: steer a living tree through a dangerous forest, multiply the tips you control, and turn a short arcade run into a botanical portrait of your choices.

## The moment worth building

Two tips approach different pockets of light. Moving left protects one but sends the other toward a thorn. You choose what the tree becomes. A fork is both a reward and a new responsibility; a lost branch is survivable. This decision, rather than the tree theme alone, is our originality hypothesis.

## Rules for the first version

- Growth is automatic. Left/right or A/D steer every tip. Pointer or touch dragging supplies the same horizontal intent.
- Light motes add score. Living branches increase the collection multiplier, capped with the tip count.
- A distinct fork bud splits the collecting tip into two. Maximum six live tips; excess buds award points.
- Thorns prune the tip that touches them. Earlier wood remains. The run ends only when the final living tip is lost.
- Reaching the canopy completes the run. Target length: 90 seconds. Most failed early attempts should last long enough to understand why they ended.
- Score rewards light collection and keeping several branches alive, with a completion bonus. Merely waiting on a safe line must not be the best scoring strategy.
- Restart takes one action. First-run instructions stay short and introduce danger progressively.

Initial tuning values are hypotheses. Automated tests establish correctness; playtests establish whether those values are enjoyable.

## Three-act ascent

| Act | Approximate duration | Experience |
| --- | --- | --- |
| Forest floor | 0–25 seconds | Learn steering, collect light, see the first fork, encounter generous hazards |
| The understory | 25–60 seconds | Alternating safe corridors and tempting light create branch-saving decisions |
| The canopy | 60–90 seconds | Tighter patterns, warmer light, final ascent and completion |

Only thorns are required in the first playable. Wind and draining shade are deferred until basic steering feels fair; three hazards are not inherently better than one well-tuned hazard.

## Visual direction

Think an illuminated botanical field journal: a forest that feels still until your tree writes a glowing path through it. Deep pine and petrol backgrounds; thin ivory rules; elegant serif display type; small tracked sans-serif labels; amber sap; sage motes; restrained coral danger. Avoid a generic neon dashboard or UI kit.

The title screen is a composed scene with a branching tree, distant trunks, a large soft sun, drifting spores and a concise invitation to play. During the run, decoration frames a clear portrait-shaped arena. Progress from subterranean green to warm morning light. Forks bloom briefly; pruning sheds a small burst; collecting light plays a note. All essential feedback remains understandable with audio off and reduced effects on.

At the end, reveal a portrait made from the actual branch paths, including failed branches. Preserve topology and horizontal decisions while compressing the vertical axis into a framed specimen. The portrait includes score, canopy progress and seed. An optional illustrated title tree is decorative; it must not be substituted for the player's result.

## Audio

Use original synthesized soft chimes, a restrained low drone and a short finishing phrase. Derive pickup notes from a pentatonic palette. Bound simultaneous voices, avoid a note for every frame, and provide a persistent mute button. Start or resume the AudioContext only after a user gesture.

## Scope discipline

Required: one complete loop; desktop and touch controls; fair introduction; live forks; thorns; scoring; pause; mute; reduced effects; authentic end portrait; local best; fast retry; credits; public static deployment.

Stretch only after playtesting: wind, shade, seeded challenge links, a daily seed, a richer musical arrangement. Do not add wallets, token rewards, a blockchain contract, accounts, online leaderboards, multiplayer or an upgrade economy to this entry.

## Playtest gates

Ask at least three people to start without coaching. Observe rather than explain.

1. Can they move intentionally in five seconds?
2. Do they understand that all tips share steering after the first fork?
3. Can they explain the first branch loss?
4. Do they willingly play again?
5. Can they identify their own choices in the portrait?

If control feels arbitrary, reduce fork spread or the live-tip cap before adding content. If the portrait resembles tangled string, tune path curvature and the projection without replacing actual run data. If no one replays, change risk/reward pacing before polishing another particle.
