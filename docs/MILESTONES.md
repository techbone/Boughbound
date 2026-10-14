# Milestones

Use acceptance gates, not the number of features or documents, to mark progress. Dates below use Africa/Lagos (UTC+1). Complete development before preparing the contest submission with the user.

| Milestone | Target | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0 — Research and architecture | Wed 14 Oct | Official rules checked; closest references identified; scoped design and implementation boundaries recorded | Complete |
| 1 — Playable core | Wed 14 Oct | Start, steer, fork, collect, lose/win, pause and restart work; simulation tests and production build pass | In progress |
| 2 — Presentation and portrait | Thu 15 Oct | Cohesive art/audio, real-run PNG, clear menus, touch layout and local best | Planned |
| 3 — Playtest and release | Fri 16 Oct, early | Uncoached playtests, Chrome/Safari/real phone checks, tuning, clean CI and public deployment | Planned |
| 4 — Submission preparation | Fri 16 Oct, before evening | User-reviewed entry details, public source, playable URL, optional video/post and submission receipt | Planned |

## Commit plan

1. `docs: define Boughbound architecture and contest research`
2. `feat: implement deterministic branching arcade core`
3. `feat: add forest presentation and growth portraits`
4. `fix: refine playability and verify release candidate`

Commit boundaries may move to keep each change coherent. Push to the user-provided GitHub remote after linking it. Do not squash away the history that demonstrates work during the round.

## Inputs needed later

- GitHub remote URL when the user finishes creating it. An empty repository is easiest; existing commits must be inspected and preserved.
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
