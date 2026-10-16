# Local release checks

Run `npm run check` and `npm run build` locally. GitHub Actions are intentionally absent. Use Node 22.12+; the verified release used 22.23.2.

## Development rehearsal

Start `npm run dev`, then open http://127.0.0.1:5173/?qa. The panel is loaded behind `import.meta.env.DEV`; Vite removes its import and module from production. Adding `?qa` to a production URL does not expose these controls. Rehearsals can update the local development origin's best score.

- **Replay canopy** follows the tested corridor controller on seed 42 through every simulation tick. It periodically renders the actual state, then leaves the application to enter its normal reveal/results flow. This accelerates the run; it is not a manual playtest or a test of 90 seconds of real-time input/audio scheduling.
- **Replay loss** uses idle input on the same course. Confirm that it ends with a valid portrait, score and retry action.
- **Repeat 10 runs** restarts and completes the same course ten times. Compare the displayed scene-node counts. Stable counts establish a bounded scene graph for that scenario, not a complete heap or GPU-memory audit. Accelerated rendering can occupy the main thread; do not use those intervals as a gameplay benchmark.
- **Lose graphics / Restore graphics** use the browser's actual `WEBGL_lose_context` extension when available. Start a normal run first. Loss must pause it and disable resume/restart; restoration must enable deliberate resume and restore the image.
- **Hide checks** removes the panel from the view for screenshots. Reload to show it again.

The rolling animation-frame intervals describe this desktop/browser session. They do not measure a physical phone, network loading time or all rendering work. Keep phone performance as a separate test.

## Human and device pass

Use the production HTTPS link without explaining the mechanics first. Observe intentional movement within five seconds, understanding of shared steering after a fork, a fair explanation for the first lost branch, and willingness to retry. A short game can be simple and replayable; add mechanics only when observations identify a specific missing choice.

On a real phone, check local reversal after a long drag, long presses without text selection, background/foreground pause, mute, reduced effects and PNG saving. On desktop, check arrows/A–D, mouse dragging, blur/hidden-tab pause, deliberate resume and a complete manual ascent in Chrome and Safari. Record the browser/device and outcome; a resized desktop viewport is only a layout check.
