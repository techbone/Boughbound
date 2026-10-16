# Milestones

Use acceptance gates, not the number of features or documents, to mark progress. Dates below use Africa/Lagos (UTC+1). Complete development before preparing the contest submission with the user.

| Milestone | Target | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0 — Research and architecture | Wed 14 Oct | Official rules checked; closest references identified; scoped design and implementation boundaries recorded | Complete |
| 1 — Playable core | Wed 14 Oct | Implement the full loop; simulation tests and production build pass; browser start, steer, fork, loss and pause smoke checks pass | Complete; broader browser verification remains below |
| 2 — Presentation and portrait | Thu 15 Oct | Cohesive art/audio, real-run PNG, clear menus, touch layout and local best | Complete; hosted PNG saved and visually verified |
| 3 — Playtest and release | Fri 16 Oct, early | Uncoached playtests, Chrome/Safari/real phone checks, tuning, passing local checks and public deployment | Engineering checks pass; owner confirms phone controls; first-time player and separate Safari checks remain |
| 4 — Submission preparation | Fri 16 Oct, before evening | User-reviewed entry details, public source, playable URL, optional video/post and submission receipt | Entry draft and video prepared; public clip upload, final review and submission remain |

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

- [x] `npm ci` on a clean environment, type checks, simulation tests, production build.
- [x] No captured console errors in the available in-app browser during loading, playing, pause/resume, results, graphics restoration and repeated renderer restarts.
- [ ] Keyboard and touch, blur/hidden-tab safety, small portrait and short landscape screens.
- [ ] Chrome and Safari; real phone frame rate and input feel measured.
- [x] Reduced effects and sound off retain essential visual feedback in win/loss checks.
- [x] Hosted portrait download saved as a valid PNG and visually inspected; unavailable-export error messages are implemented.
- [x] Public game link works without login; local build instructions and lockfile are present.
- [x] Credits and dependency notices are included; title and URLs are final.
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

## Real-phone feedback — 15 October

The owner's iPhone screenshots exposed issues that viewport simulation did not establish: text arrows rendered as emoji, touch steering needed too much travel, and holding/dragging could select the page. Replaced interface glyphs with original stroke SVG icons, shortened touch/pen steering travel to 28px (mouse remains 60px), and made the origin follow long swipes for easier reversal. Added selection/callout CSS and active-play selection/context-menu guards without changing simulation movement limits.

Also corrected mobile result-heading spaces, kept the portrait frame fitted to its actual aspect ratio, prevented automatic retry focus from scrolling past the portrait, and compacted the title layout for short phones. Checked layouts at 390×667 and 320×568. All 19 tests pass, including five input regressions covering sensitivity, reversal, cancellation, multiple pointers, keyboard/blur handling and selection suppression. The owner still needs to confirm the updated feel and long-press behavior on the actual phone after deployment.

## Release checkpoint — 16 October

The owner confirmed that mobile steering reversal and accidental page selection are both resolved. Their question about simplicity does not establish whether first-time players want another run. Preserve the controls and rules for now: show the existing light multiplier, bloom surviving tips at the canopy, and explain the completion bonus on the result screen. No additional hazard, account system or progression economy was added.

A clean temporary source copy installed all pinned packages with `npm ci`, passed all 19 tests and built successfully with Node 22.23.2. The default elevated shell initially selected a Node executable with the wrong CPU architecture; explicitly selecting the working ARM runtime resolved that environment issue. The production bundle contains no QA control strings or QA module, and includes dependency notices.

The local development-only QA panel exercised an accelerated seed-42 victory through the real application's reveal/results flow: 990 light, 100% canopy, peak two tips and a 650-point completion bonus. Ten replays of the same complete run each retained 30 scene nodes. This checks renderer cleanup, not total JavaScript/GPU memory retention, real-time human play or all possible seeds. Loss and victory remain legible with sound muted and reduced effects enabled.

During a normal active run, the actual WebGL context-loss extension paused play and disabled resume/restart. Restoration enabled deliberate resume, the forest rendered again and captured console logs contained no warning/error entries. Keyboard pause/resume was also exercised in the clean production build. Win layout was inspected at 390×667; production title/layout checks covered 320×568 and 844×390. Temporary viewport overrides were reset.

Safari/native Chrome checks could not run because macOS native app control permission is unavailable; the in-app browser is the verified browser. Switching between automation tabs did not produce a document visibility change, so it is not evidence for the hidden-tab pause check. Real-phone frame timing, separate Safari/Chrome runs, a full manual victory, broader memory measurements and the planned uncoached playtests remain explicit release limitations. See `docs/QA.md` for repeatable local checks.

## Trailer preparation — 16 October

Created a 45-second, 1920×1080, 30 fps H.264/AAC MP4 and matching cover, saved in the owner's Downloads folder. The 7,947,063-byte video uses actual simulation/rendering with ordinary scripted steering on seed 2. Gameplay excerpts run at normal speed and later cuts are labelled; this is not evidence of a manual victory. The run reaches five tips, finishes with 2,020 light, and supplies the exact portrait shown in the video. Original synthesized stereo music and synchronized game cues are included.

Inspected exported frames across all scenes, verified browser playback and seeking, decoded the complete MP4 without errors, and confirmed the downloaded file matches the export. The MP4 places streaming metadata before media data. Type checking and the production build pass; the game bundle hash is unchanged because recording tools are excluded from production. The owner still needs to upload the clip and use its public URL in the entry. Source and reproduction details are in `tools/TRAILER.md`.
