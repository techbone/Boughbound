# Research and constraints

Checked 14 October 2026. Findings distinguish verified facts from design inference.

## Contest

Primary source: [Project Treetop official page](https://twigpine.com/treetop). The search tool could not open it, but a direct HTTPS fetch succeeded with HTTP 200 and the HTML text was inspected. The findings below match the user-supplied page text.

| Requirement | Consequence |
| --- | --- |
| Games round: 9–16 October, closes 16 October 2026 at 23:59 UTC | Lagos deadline: 17 October at 00:59 WAT. Target a playable submission well before the cutoff. |
| Build during the round; history should show when | Start fresh, preserve truthful incremental Git history. |
| Public browser link, no installation or account | Static site, no wallet or sign-in gate. |
| Any engine/language/stack, AI tools expressly allowed | TypeScript/PixiJS and AI-assisted development are permitted. |
| Own work or assets with usage rights; no others' characters/logos/brands | Original procedural artwork/audio; retain third-party dependency notices. No sponsor logo in the game. |
| One entry per builder per round; latest resubmission judged | Update the same entry before cutoff if necessary. |
| Teams allowed; one payout wallet | Confirm one Base address for the entry at submission time. |
| One winner, $1,000 in USDC on Base | Base is a payment requirement, not a game implementation requirement. |
| Fun, originality and polish | Prioritize immediate play, a readable decision and a complete finish. |
| Public source repository or archive required | Prepare a clean buildable repository. A particular open-source license is not mandated in the supplied form. |
| X sharing encouraged but explicitly not a condition | Prepare a post later; do not treat posting as eligibility. |
| Winner within a week; email first | Submission needs a monitored email. |

The six required fields are name, play URL, source URL, X handle, Base wallet and email, plus the rules attestation. One-line description and a short video are optional. The extra `Website` field in extracted text must not be assumed to be a required entrant field; inspect the live form when submitting. November and December briefs/dates are not yet supplied by the page.

No win is guaranteed. Organizer reputation, payout history and eligibility for a particular entrant were not independently audited by this game-design research.

## Closest references and honest novelty

| Source | What exists | How our proposed game differs |
| --- | --- | --- |
| [Sunlit, creators' itch.io page](https://palsina.itch.io/sunlit) | Mouse pruning to direct tree growth through shadows toward light | We continuously steer several tips together under arcade pressure; the main action is not pruning by drawing cuts. |
| [Zen Garden, developer page](https://hoagiecorps.com/games/zen-garden) | Prune a bonsai, reach lanterns, photograph its shape; no timer or score | Our run has a score, short finite ascent and synchronized tip steering. A tree portrait by itself is not a novel feature. |
| [Tanglevine, developer page](https://shahawiapps.com/games/tanglevine/) | Browser grow-and-dodge game with one vine, fruit, self-collision and combo scoring | Our forked tree has several simultaneous heads, persistent dead branches and no snake-tail self-collision. |
| [Season Grove, creator page](https://bonkplay.itch.io/season-grove) | Arcade pruning and seasonal survival | Confirms that tree games are not all slow or meditative; our differentiator must be the specific control/risk structure. |
| [Lightward, creator portfolio](https://philipp-juhl.com/lightward) | Turn-based tactical game | The theme/loop differs, but the title is already in use. |
| [Lightward, developer Steam update](https://steamcommunity.com/app/1492830) | A platformer/Metroidvania also uses Lightward | Further naming collision; choose a more distinctive title. |

The earlier proposition that related tree games are all slow or zen is too broad. The defensible pitch is: **one steering input, multiple living tips, risk through branching, and a portrait made from your actual run**. Research did not find that precise combination in the checked references. This is not exhaustive novelty or trademark clearance.

Exact-title searches for **Boughbound** found unrelated literary uses but no matching game in the returned results. Adopt it as the public title; keep `lightward` as the repository codename. Search results can change, so do not market it as a globally unused word.

## Technical sources

- [PixiJS Application](https://pixijs.com/8.x/guides/components/application): v8 uses asynchronous `Application.init`; supports a WebGL rendering preference and resolution controls.
- [PixiJS performance guidance](https://pixijs.com/8.x/guides/concepts/performance-tips): avoid excessive changing complex graphics and filters. This motivates chunked paths and sprite-based glows.
- [Vite getting started](https://vite.dev/guide/): static production build; required Node versions include 22.12+. Local Node 22.23.2 satisfies that requirement.
- [MDN Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events): unified pointer input and capture; handle cancellation rather than relying on mouse-only events.
- [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): detect hidden tabs and pause safely.
- [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices): user-gesture startup and user volume control inform the sound lifecycle.

Library versions will be resolved during installation and recorded in the lockfile. Browser compatibility and bundle size must be measured on the actual build rather than inferred from documentation alone.
