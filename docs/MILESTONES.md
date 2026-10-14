# Milestones

Use acceptance gates, not the number of features or documents, to mark progress. Dates below use Africa/Lagos (UTC+1). Complete development before preparing the contest submission with the user.

| Milestone | Target | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0 — Research and architecture | Wed 14 Oct | Official rules checked; closest references identified; scoped design and implementation boundaries recorded | Complete |
| 1 — Playable core | Wed 14 Oct | Implement the full loop; simulation tests and production build pass; browser start, steer, fork, loss and pause smoke checks pass | Complete; broader browser verification remains below |
| 2 — Presentation and portrait | Thu 15 Oct | Cohesive art/audio, real-run PNG, clear menus, touch layout and local best | In progress; art/audio/export implemented, download verification pending |
| 3 — Playtest and release | Fri 16 Oct, early | Uncoached playtests, Chrome/Safari/real phone checks, tuning, clean CI and public deployment | Planned |
| 4 — Submission preparation | Fri 16 Oct, before evening | User-reviewed entry details, public source, playable URL, optional video/post and submission receipt | Planned |

## Commit plan

1. `docs: add architecture`
2. `feat: add playable game`
3. `fix: protect game state`

Commit boundaries may move to keep each change coherent. Push to the user-provided GitHub remote after linking it. Do not squash away the history that demonstrates work during the round.

## Inputs needed later

- GitHub remote is configured: `git@github-personal:techbone/Boughbound.git`.
- Repository-local author is `musaawwaletudaye <79253346+techbone@users.noreply.github.com>`; use short subject-only commits and no coauthor trailers.
- Hosting access or an existing deployment project when ready to publish.
- Three brief human playtests and one real phone test before calling the game release-ready.
- Submission name/handle, email and Base payout address at the submission milestone. Never require a private key or seed phrase.

## Release checklist

- [ ] `npm ci` on a clean environment, type checks, simulation tests, production build.
- [ ] No console errors during loading, playing, pause/resume, results or repeated restart.
- [ ] Keyboard and touch, blur/hidden-tab safety, small portrait and short landscape screens.
- [ ] Chrome and Safari; real phone frame rate and input feel measured.
- [ ] Reduced effects and sound off retain essential feedback.
- [ ] PNG reflects the actual run; download failure gives a useful message.
- [ ] Public link works without login; source builds from README instructions.
- [ ] Credits and dependency notices are included; title and URLs are final.
- [ ] Real first-time players understand the forks and want another attempt.

## Review checkpoint — 14 October

Reviewed simulation ordering and branch topology, input cleanup, app states, renderer resource bounds, local storage and portrait generation. This was a direct code review, not an independent reviewer or proof of game quality.

Fixed repeated Escape toggling, resuming during graphics-context loss, and an older tab overwriting a newer high score. Added three storage regression tests. Type checking, all 13 tests and the production build pass. Earlier tests also check branching limits, pickup consumption, collision ordering, terminal states, seed reproducibility and course corridor constraints.

Browser evidence: title screen loads without captured warning/error logs; starting, keyboard steering, first fork, pruning, loss/result transition and pause were exercised. A 390×844 viewport was inspected; that is layout verification, not a real phone performance test. The result DOM contained the portrait and expected score/actions. The PNG-download automation was interrupted before confirming a saved file.

Still needed before release: verify downloaded PNG, inspect the result portrait visually, browser win/resume/retry checks, pointer/touch play, short landscape layout, real Safari/phone runs, context-loss recovery in a browser, memory/performance measurements and uncoached human playtests. Tune branching and difficulty from those observations before adding a second hazard.
