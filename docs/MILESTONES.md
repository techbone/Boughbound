# Milestones

Use acceptance gates, not the number of features or documents, to mark progress. Dates below use Africa/Lagos (UTC+1). Complete development before preparing the contest submission with the user.

| Milestone | Target | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0 — Research and architecture | Wed 14 Oct | Official rules checked; closest references identified; scoped design and implementation boundaries recorded | Complete |
| 1 — Playable core | Wed 14 Oct | Implement the full loop; simulation tests and production build pass; browser start, steer, fork, loss and pause smoke checks pass | Complete; broader browser verification remains below |
| 2 — Presentation and portrait | Thu 15 Oct | Cohesive art/audio, real-run PNG, clear menus, touch layout and local best | Complete; hosted PNG saved and visually verified |
| 3 — Playtest and release | Fri 16 Oct, early | Uncoached playtests, Chrome/Safari/real phone checks, tuning, passing local checks and public deployment | In progress; public deployment verified, device and human playtests remain |
| 4 — Submission preparation | Fri 16 Oct, before evening | User-reviewed entry details, public source, playable URL, optional video/post and submission receipt | Planned |

## Commit plan

1. `docs: add architecture`
2. `feat: add playable game`
3. `fix: protect game state`

Commit boundaries may move to keep each change coherent. Push to the user-provided GitHub remote after linking it. Do not squash away the history that demonstrates work during the round.

Use local checks only. Do not add GitHub Actions workflows; the owner requested their removal on 14 October because of GitHub billing restrictions.

## Inputs needed later

- GitHub remote is configured: `git@github-personal:techbone/Boughbound.git`.
- Repository-local author is `musaawwaletudaye <79253346+techbone@users.noreply.github.com>`; use short subject-only commits and no coauthor trailers.
- The owner will deploy to Vercel personally; provide the final public URL for verification. Build settings are in `docs/DEPLOYMENT.md` and `vercel.json`.
- Three brief human playtests and one real phone test before calling the game release-ready.
- Submission name/handle, email and Base payout address at the submission milestone. Never require a private key or seed phrase.

## Release checklist

- [ ] `npm ci` on a clean environment, type checks, simulation tests, production build.
- [ ] No console errors during loading, playing, pause/resume, results or repeated restart.
- [ ] Keyboard and touch, blur/hidden-tab safety, small portrait and short landscape screens.
- [ ] Chrome and Safari; real phone frame rate and input feel measured.
- [ ] Reduced effects and sound off retain essential feedback.
- [x] Hosted portrait download saved as a valid PNG and visually inspected; unavailable-export error messages are implemented.
- [x] Public game link works without login; local build instructions and lockfile are present.
- [ ] Credits and dependency notices are included; title and URLs are final.
- [ ] Real first-time players understand the forks and want another attempt.

## Review checkpoint — 14 October

Reviewed simulation ordering and branch topology, input cleanup, app states, renderer resource bounds, local storage and portrait generation. This was a direct code review, not an independent reviewer or proof of game quality.

Fixed repeated Escape toggling, resuming during graphics-context loss, and an older tab overwriting a newer high score. Added three storage regression tests. Type checking, all 13 tests and the production build pass. Earlier tests also check branching limits, pickup consumption, collision ordering, terminal states, seed reproducibility and course corridor constraints.

Browser evidence: title screen loads without captured warning/error logs; starting, keyboard steering, first fork, pruning, loss/result transition and pause were exercised. A 390×844 viewport was inspected; that is layout verification, not a real phone performance test. The result DOM contained the portrait and expected score/actions. The PNG-download automation was interrupted before confirming a saved file.

Still needed before release: verify downloaded PNG, inspect the result portrait visually, browser win/resume/retry checks, pointer/touch play, short landscape layout, real Safari/phone runs, context-loss recovery in a browser, memory/performance measurements and uncoached human playtests. Tune branching and difficulty from those observations before adding a second hazard.

## Playability checkpoint — 15 October

Adjusted the generated course after a 100-seed probe found that 42 idle runs could reach the canopy. Later corridors now make readable lateral sweeps, and thorns line their outer edges instead of leaving incidental safe lanes. In the updated 100-seed check, a simple controller following the visible corridor completed every course; idle input completed none. This establishes a reachable route and an active-play requirement, not human difficulty or fun. The test is retained in `src/game/playability.test.ts`. All 14 local tests and the production build pass.

Inspected the actual portrait on the desktop result screen. Browser retry, drag input, held-Escape pause and deliberate resume were exercised, and the short 844×390 title layout was inspected. The portrait button reports a generated download, but a saved browser-download file has not yet been confirmed. Safari, a real phone, context recovery and browser victory are still release checks.

Vercel settings and the lockfile are ready for the owner's deployment. GitHub Actions remain removed. Send the deployed URL back for public-host testing, and try two uncoached runs on desktop and one on a phone. Report whether shared steering is understandable, whether branch losses feel fair, and whether the portrait downloads.

## Public deployment checkpoint — 15 October

Production URL: https://boughbound.vercel.app/. The owner deployed it. The public HTML references `index-DjH4arQV.js`, matching the reviewed local build. The title screen loads without an account. Exercised start, light collection, the first fork, branch loss, the result screen, retry, pause/resume and pointer dragging on the deployed game. Captured game console logs contained no warning/error entries during the initial checks.

The deployed Keep your tree button triggered a browser download. The saved file has a valid PNG signature, 900×1100 dimensions and opens correctly. Its score (130), canopy progress (24%) and tip count (2) match the corresponding result screen. This closes the previously outstanding download check.

Inspected a 390×844 hosted layout and reset the temporary viewport afterwards. Desktop simulation of that viewport does not verify real-phone touch input, frame rate or Safari behavior. Those checks, browser victory/context recovery, memory measurements and uncoached human feedback remain in Milestone 3. No new game-code defects were identified by this bounded hosted smoke test. The previously passing 14 tests and production build still apply because this checkpoint changes documentation only.
