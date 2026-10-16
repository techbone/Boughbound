import './style.css';
import { GAME, HEIGHT } from './config';
import { createRun, stepRun } from './game/simulation';
import type { RunState } from './game/types';
import { Soundscape } from './platform/audio';
import { Input } from './platform/input';
import { drawPortrait, downloadPortrait } from './platform/portrait';
import { readPreferences, savePreferences } from './platform/storage';
import { ForestScene } from './render/scene';

const el = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing interface element: ${id}`);
  return element as T;
};
type Mode = 'loading' | 'title' | 'playing' | 'paused' | 'revealing' | 'results';
let mode: Mode = 'loading';
let run: RunState | null = null;
let accumulator = 0;
let lastTime = 0;
let revealTime = 0;
let toastTime = 0;
let seenFork = false;
let seenLoss = false;
let lastAct = 0;
let portraitReady = false;
let hudScore = -1;
let hudTips = -1;
let graphicsReady = true;
const preferences = readPreferences();
const sound = new Soundscape();
const scene = new ForestScene();
const input = new Input(el('scene'));
const portrait = el<HTMLCanvasElement>('portrait');

function setMode(next: Mode): void {
  mode = next; input.enabled = next === 'playing'; input.clear(); accumulator = 0;
  document.body.dataset.mode = next;
  for (const [id, visible] of Object.entries({ loading: next === 'loading', title: next === 'title', hud: next === 'playing' || next === 'revealing', paused: next === 'paused', results: next === 'results', pause: next === 'playing' })) {
    el(id).hidden = !visible;
  }
  if (next === 'paused') el('resume').focus({ preventScroll: true });
  if (next === 'results') {
    el('results-panel').scrollTop = 0;
    el('retry').focus({ preventScroll: true });
  }
  if (next === 'title') el('start').focus({ preventScroll: true });
}

function settings(): void {
  sound.setMuted(preferences.muted); scene.reduced = preferences.reduced;
  el('sound').setAttribute('aria-pressed', String(!preferences.muted));
  el('sound-label').textContent = preferences.muted ? 'Sound off' : 'Sound on';
  el('sound').setAttribute('aria-label', preferences.muted ? 'Turn sound on' : 'Turn sound off');
  el('effects').setAttribute('aria-pressed', String(preferences.reduced));
  el('effects').setAttribute('aria-label', preferences.reduced ? 'Enable full visual effects' : 'Reduce visual effects');
  savePreferences(preferences);
}

function start(seed?: number): void {
  if (!graphicsReady) return;
  void sound.unlock(); sound.stop();
  const seeds = new Uint32Array(1); crypto.getRandomValues(seeds);
  run = createRun(seed ?? seeds[0]); scene.start(); seenFork = false; seenLoss = false; lastAct = 0; toastTime = 0; portraitReady = false;
  el('milestone').classList.remove('visible'); setMode('playing'); updateHUD();
  (document.activeElement as HTMLElement | null)?.blur();
}

function pause(): void { if (mode === 'playing') { setMode('paused'); sound.stop(); } }
function resume(): void { if (mode === 'paused' && graphicsReady) { void sound.unlock(); setMode('playing'); (document.activeElement as HTMLElement | null)?.blur(); } }
function toast(message: string): void { el('milestone').textContent = message; el('milestone').classList.add('visible'); toastTime = 2.4; }

function updateHUD(): void {
  if (!run) return;
  if (run.score !== hudScore) { el('score').textContent = String(run.score).padStart(4, '0'); hudScore = run.score; }
  if (run.tips.length !== hudTips) {
    el('tips').replaceChildren(document.createTextNode(`${run.tips.length} `), Object.assign(document.createElement('small'), { textContent: '/ 6' }));
    el('multiplier').textContent = `${run.tips.length}× LIGHT`;
    hudTips = run.tips.length;
  }
  const percent = Math.round(run.height / HEIGHT * 100);
  el('height').textContent = `${percent}%`; el('progress').style.width = `${percent}%`;
  const act = run.elapsed >= 60 ? 2 : run.elapsed >= 25 ? 1 : 0;
  el('act').textContent = ['01 — FOREST FLOOR', '02 — THE UNDERSTORY', '03 — THE CANOPY'][act];
  if (act !== lastAct) { lastAct = act; toast(act === 1 ? 'Into the understory.' : 'The light is closer now.'); }
  let hint = 'Drag left or right, or use arrow keys, to guide your tip';
  if (run.elapsed > 3 && !seenFork) hint = 'The golden branching bud grows a second tip';
  if (seenFork) hint = 'One motion guides every tip · light earns more with more branches';
  if (run.elapsed > 7 && run.elapsed < 12) hint = 'Thorns prune a tip. Keep at least one alive.';
  if (run.elapsed > 18) hint = 'Keep one alive. Reach the canopy.';
  el('hint').textContent = hint;
}

function finish(): void {
  if (!run) return;
  const oldBest = Math.max(preferences.best, readPreferences().best);
  preferences.best = Math.max(oldBest, run.score); savePreferences(preferences);
  const won = run.phase === 'won';
  el('result-kicker').textContent = won ? 'FROM A SEED TO THE SKY' : 'A LIFE, BEAUTIFULLY BRANCHED';
  el('result-heading').textContent = won ? 'You found the light.' : 'You became something.';
  el('result-description').textContent = won ? `The canopy is yours. +${(500 + run.tips.length * 150).toLocaleString()} light for reaching it with ${run.tips.length} living ${run.tips.length === 1 ? 'tip' : 'tips'}.` : 'Some branches rest. The story remains. Try a different path.';
  el('result-score').textContent = run.score.toLocaleString(); el('result-progress').textContent = `${Math.round(run.height / HEIGHT * 100)}%`; el('result-tips').textContent = String(run.peakTips);
  el('best').textContent = run.score > oldBest ? 'A NEW PERSONAL BEST' : `YOUR BEST · ${preferences.best.toLocaleString()} LIGHT`;
  try { drawPortrait(portrait, run); portraitReady = true; el('export-status').textContent = 'Your choices, pressed into a growth portrait.'; }
  catch { portraitReady = false; el('export-status').textContent = 'Portrait unavailable in this browser. Your score is saved.'; }
  el<HTMLButtonElement>('download').disabled = !portraitReady;
  setMode('results');
}

for (const id of ['start', 'retry', 'pause-restart']) el(id).addEventListener('click', () => start());
el('pause').addEventListener('click', pause); el('resume').addEventListener('click', resume);
el('home').addEventListener('click', () => { sound.stop(); run = null; scene.title(); setMode('title'); });
el('sound').addEventListener('click', () => { preferences.muted = !preferences.muted; void sound.unlock(); settings(); });
el('effects').addEventListener('click', () => { preferences.reduced = !preferences.reduced; settings(); });
el('credits-open').addEventListener('click', () => el<HTMLDialogElement>('credits').showModal());
el('credits-close').addEventListener('click', () => el<HTMLDialogElement>('credits').close());
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !event.repeat) { if (mode === 'playing') pause(); else if (mode === 'paused') resume(); } });
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
const preventGameSelection = (event: Event): void => { if (mode === 'playing') event.preventDefault(); };
document.addEventListener('selectstart', preventGameSelection);
document.addEventListener('contextmenu', preventGameSelection);
el('download').addEventListener('click', async () => {
  if (!run || !portraitReady) return;
  const button = el<HTMLButtonElement>('download'); button.disabled = true;
  try { await downloadPortrait(portrait, run.seed); el('export-status').textContent = 'Your portrait is ready. Check your browser downloads.'; }
  catch { el('export-status').textContent = 'The download failed. Please try again in your full browser.'; }
  finally { button.disabled = false; }
});
el('share').addEventListener('click', () => {
  if (!run) return;
  const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const message = `I grew ${run.score.toLocaleString()} light and reached ${Math.round(run.height / HEIGHT * 100)}% of the canopy in Boughbound. Every branch is a chance. @twigpine`;
  const params = new URLSearchParams({ text: message }); if (!isLocal) params.set('url', location.origin + location.pathname);
  window.open(`https://x.com/intent/post?${params}`, '_blank', 'noopener,noreferrer');
});

function frame(now: number): void {
  const delta = Math.min(.1, (now - (lastTime || now)) / 1000); lastTime = now;
  if (mode === 'playing' && run) {
    accumulator += delta; let steps = 0;
    while (accumulator >= GAME.step && steps < 6 && run.phase === 'playing') {
      const events = stepRun(run, input.value());
      scene.effects(events);
      for (const event of events) {
        sound.event(event);
        if (event.kind === 'fork' && !seenFork) { seenFork = true; toast('One seed. Two possibilities.'); }
        if (event.kind === 'prune' && !seenLoss && run.tips.length) { seenLoss = true; toast('A branch lost. A chance remains.'); }
      }
      accumulator -= GAME.step; steps++;
    }
    if (steps === 6) accumulator = 0;
    updateHUD();
    if (run.phase !== 'playing') {
      setMode('revealing'); revealTime = preferences.reduced ? .15 : run.phase === 'won' ? 2.2 : 1.1;
      if (run.phase === 'won') toast('The canopy is yours.');
    }
  }
  if (mode === 'revealing') { revealTime -= delta; if (revealTime <= 0) finish(); }
  if (toastTime > 0) { toastTime -= delta; if (toastTime <= 0) el('milestone').classList.remove('visible'); }
  if (graphicsReady) scene.render(run, mode === 'paused' ? 0 : delta);
  requestAnimationFrame(frame);
}

async function boot(): Promise<void> {
  try {
    await scene.init(el('scene')); settings(); setMode('title');
    scene.app.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault(); graphicsReady = false; pause();
      el('pause-heading').textContent = 'The forest needs a moment.';
      for (const id of ['start', 'resume', 'pause-restart', 'retry']) el<HTMLButtonElement>(id).disabled = true;
    });
    scene.app.canvas.addEventListener('webglcontextrestored', () => {
      graphicsReady = true; el('pause-heading').textContent = 'Still growing.';
      for (const id of ['start', 'resume', 'pause-restart', 'retry']) el<HTMLButtonElement>(id).disabled = false;
    });
    requestAnimationFrame(frame);
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('qa')) {
      const { mountQA } = await import('./dev/qa');
      mountQA({ start, readRun: () => run, scene });
    }
  } catch (error) {
    console.error('Boughbound could not initialize:', error);
    el('loading').replaceChildren();
    const heading = document.createElement('p'); heading.textContent = 'The forest could not wake.';
    const detail = document.createElement('p'); detail.style.fontSize = '14px'; detail.textContent = 'Try reloading in a current browser with graphics acceleration enabled.';
    const reload = document.createElement('button'); reload.className = 'secondary-button'; reload.style.margin = '24px auto'; reload.textContent = 'Reload'; reload.onclick = () => location.reload();
    el('loading').append(heading, detail, reload);
  }
}
void boot();
