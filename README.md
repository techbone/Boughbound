# Boughbound

**Every branch is a chance.**

A browser arcade game about steering a growing tree toward the canopy. One input guides every living tip. Collect light, choose when to branch, and protect at least one tip. The tree left behind is a record of your decisions.

Repository codename: `lightward`. Public title: **Boughbound**.

## Project documents

- [Architecture](docs/ARCHITECTURE.md) — boundaries, data flow, technical choices, performance and verification.
- [Game design](docs/GAME_DESIGN.md) — rules, visual direction, scope and playtest questions.
- [Research](docs/RESEARCH.md) — contest requirements, comparable games, technical sources and uncertainties.
- [Milestones](docs/MILESTONES.md) — delivery gates and current status.

## Development

Node.js 22.12+ and npm. Dependencies are pinned by the lockfile.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

The production output is `dist/`, suitable for a static HTTPS host such as Vercel. No server, credentials, wallet connection, or paid API is needed to play.

Validation runs locally with `npm run check` and `npm run build`. This repository intentionally has no GitHub Actions workflows.

## Attribution and ownership

Original game code, procedural art and synthesized audio are created for this project during the October 2026 round. Dependencies retain their own licenses. See [credits](docs/CREDITS.md). No project-wide redistribution license has been selected yet; a public repository does not itself grant one.

This is an independent entry. It is not an official Twigpine product. Prize eligibility and submission remain subject to the organizer's rules.
