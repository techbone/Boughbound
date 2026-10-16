# Boughbound

**Every branch is a chance.**

A browser arcade game about steering a growing tree toward the canopy. One input guides every living tip. Collect light, choose when to branch, and protect at least one tip. The tree left behind is a record of your decisions.

Play: [boughbound.vercel.app](https://boughbound.vercel.app/).

## How to play

- Steer with the arrow keys, A / D, or by holding and dragging left or right. Every living tip follows the same input.
- Gather pale light for points and catch golden buds to grow more branches. More living tips multiply the light you collect.
- Avoid thorns and keep at least one tip alive for 90 seconds to reach the canopy.
- Press Escape or use the pause button to pause. Sound and visual effects can be toggled independently.
- At the end of a run, download a botanical portrait of the tree you grew or try another path.

## Development

Node.js 22.12+ and npm. Dependencies are pinned by the lockfile.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Built with TypeScript, PixiJS, Vite and Web Audio. Art is drawn procedurally, sound is synthesized, and scores and preferences are saved in the browser.

The production output is `dist/`, suitable for a static HTTPS host such as Vercel. The included `vercel.json` configures installation and builds. No environment variables or backend are required.

## Attribution and ownership

Created by Musa Etudaye with AI-assisted development for Project Treetop, October 2026. Game code, procedural/vector artwork and synthesized audio are original to this project. Typography uses system fonts.

Dependencies retain their own licenses; bundled notices are in [THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt). No project-wide redistribution license has been selected.
