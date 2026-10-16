import { clamp } from '../game/random';
import { stepRun } from '../game/simulation';
import type { RunState } from '../game/types';
import type { ForestScene } from '../render/scene';

interface QAAdapter {
  start(seed?: number): void;
  readRun(): RunState | null;
  scene: ForestScene;
}

// Loaded only by Vite's development server with ?qa. Production builds omit it.
export function mountQA({ start, readRun, scene }: QAAdapter): void {
  const panel = document.createElement('aside');
  panel.setAttribute('aria-label', 'Local release checks');
  panel.style.cssText = 'position:fixed;z-index:100;left:8px;bottom:8px;max-width:380px;padding:12px;background:#10292bf5;border:1px solid #cbbd8c;color:#eee5c8;font:11px/1.5 monospace;pointer-events:auto;';
  const heading = document.createElement('strong'); heading.textContent = 'LOCAL QA · accelerated replay, not human play';
  const controls = document.createElement('div'); controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:8px 0';
  const status = document.createElement('output'); status.style.cssText = 'display:block;white-space:pre-wrap;user-select:text';
  const timing = document.createElement('output'); timing.style.display = 'block';
  panel.append(heading, controls, status, timing); document.body.append(panel);

  const button = (label: string, action: () => void | Promise<void>) => {
    const element = document.createElement('button'); element.textContent = label;
    element.style.cssText = 'padding:7px;background:#e7d9ab;color:#162e29;border:0;font:11px monospace;';
    element.addEventListener('click', () => {
      element.disabled = true;
      void Promise.resolve().then(action).catch((error: unknown) => { status.textContent = String(error); })
        .finally(() => { element.disabled = false; });
    });
    controls.append(element);
  };
  const counts = () => {
    let nodes = 0;
    const visit = (node: { children?: unknown[] }) => { nodes++; for (const child of node.children ?? []) visit(child as typeof node); };
    visit(scene.app.stage);
    return nodes;
  };
  const replay = (seed: number, follow: boolean) => {
    start(seed);
    const run = readRun(); if (!run) throw new Error('Run did not start');
    let ticks = 0;
    while (run.phase === 'playing' && ticks++ < 6000) {
      const next = run.corridors.find((c) => c.y > run.height - 40);
      const steer = follow && next ? clamp((next.x - run.tips[0].x) / 55, -1, 1) : 0;
      const events = stepRun(run, steer);
      scene.effects(events);
      if (ticks % 4 === 0) scene.render(run, 4 / 60);
    }
    scene.render(run, 1 / 60);
    return `${seed}: ${run.phase}, ${run.score} light, ${run.tips.length} tips, ${counts()} scene nodes`;
  };
  button('Replay canopy', () => { status.textContent = replay(42, true); });
  button('Replay loss', () => { status.textContent = replay(42, false); });
  button('Repeat 10 runs', async () => {
    const results: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Yield between runs so the local test controls remain responsive.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      results.push(replay(42, true)); status.textContent = results.join('\n');
    }
  });

  const gl = scene.app.canvas.getContext('webgl2') ?? scene.app.canvas.getContext('webgl');
  const extension = gl?.getExtension('WEBGL_lose_context');
  button('Lose graphics', () => {
    if (!extension) { status.textContent = 'Context-loss extension unavailable'; return; }
    extension.loseContext(); status.textContent = 'Graphics lost; Resume must be disabled until restored.';
  });
  button('Restore graphics', () => { extension?.restoreContext(); status.textContent = 'Restore requested; resume only after the restored event.'; });
  button('Hide checks', () => { panel.hidden = true; });

  const frames: number[] = [];
  let last = 0, lastReport = 0;
  const measure = (now: number) => {
    if (!document.hidden && last && now - last < 250) { frames.push(now - last); if (frames.length > 300) frames.shift(); }
    last = now;
    if (now - lastReport > 1000 && frames.length) {
      const sorted = [...frames].sort((a, b) => a - b);
      timing.textContent = `Frame interval: median ${sorted[Math.floor(sorted.length * .5)].toFixed(1)}ms · p95 ${sorted[Math.floor(sorted.length * .95)].toFixed(1)}ms · ${frames.length} samples`;
      lastReport = now;
    }
    requestAnimationFrame(measure);
  };
  requestAnimationFrame(measure);
}
