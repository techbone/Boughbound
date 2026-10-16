import { GAME, HEIGHT } from '../config';
import { createRun, stepRun } from '../game/simulation';
import type { GameEvent } from '../game/types';
import { drawPortrait } from '../platform/portrait';
import { ForestScene } from '../render/scene';
import { trailerSteer } from './trailer-script';

const W = 1920, H = 1080, DURATION = 45, SEED = 2;
const canvas = document.querySelector<HTMLCanvasElement>('#trailer')!;
const ctx = canvas.getContext('2d', { alpha: false })!;
const scene = new ForestScene();
const record = document.querySelector<HTMLButtonElement>('#record')!;
const preview = document.querySelector<HTMLSelectElement>('#preview')!;
const status = document.querySelector<HTMLOutputElement>('#status')!;
const manifest = document.querySelector<HTMLPreElement>('#manifest')!;
const background = document.createElement('canvas'); background.width = 960; background.height = H;
const portrait = document.createElement('canvas'); portrait.width = 900; portrait.height = 1100;
const colors = { cream: '#eeeadd', gold: '#d6c493', muted: '#b6c4b2' };
let run = createRun(SEED);
let previousVideoTime = -1, lastSection = -1, portraitReady = false;
let soundtrackEvents: { time: number; kind: GameEvent['kind']; value: number }[] = [];

function text(value: string, x: number, y: number, size = 32, color = colors.cream, serif = false, italic = false): void {
  ctx.fillStyle = color;
  ctx.font = `${italic ? 'italic ' : ''}${size}px ${serif ? 'Georgia' : 'Arial'}`;
  ctx.fillText(value, x, y);
}

function tracked(value: string, x: number, y: number, size = 18, color = colors.gold, space = 4): void {
  ctx.font = `${size}px Arial`; ctx.fillStyle = color;
  for (const char of value) { ctx.fillText(char, x, y); x += ctx.measureText(char).width + space; }
}

function sprout(x: number, y: number, scale = 1): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.strokeStyle = colors.gold; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(15, 43); ctx.lineTo(15, 12);
  ctx.bezierCurveTo(15, 0, 28, 1, 28, 1); ctx.bezierCurveTo(28, 13, 21, 17, 15, 17);
  ctx.moveTo(15, 28); ctx.bezierCurveTo(1, 28, 1, 15, 1, 15); ctx.bezierCurveTo(14, 15, 15, 23, 15, 28);
  ctx.stroke(); ctx.restore();
}

function line(x: number, y: number, width: number, alpha = .25): void {
  ctx.strokeStyle = `rgba(214,196,147,${alpha})`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + width, y); ctx.stroke();
}

function base(time: number): void {
  ctx.drawImage(background, 0, 0, W, H);
  const wash = ctx.createLinearGradient(0, 0, W, 0);
  wash.addColorStop(0, 'rgba(5,27,28,.89)'); wash.addColorStop(.5, 'rgba(5,27,28,.62)'); wash.addColorStop(1, 'rgba(5,27,28,.18)');
  ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);
  sprout(104, 66, 1.35); tracked('BOUGHBOUND', 170, 108, 25, colors.cream, 6);
  tracked('A LIVING ARCADE', 1510, 106, 17, colors.gold, 3);
  line(108, 976, 1704, .22);
  tracked('EVERY BRANCH IS A CHANCE.', 108, 1019, 15, colors.muted, 3);
  ctx.fillStyle = '#d6c493'; ctx.fillRect(108, 975, 1704 * time / DURATION, 2);
}

function copy(kicker: string, first: string, second: string, body: string[], time: number, start: number): void {
  const enter = Math.min(1, Math.max(0, (time - start) / .6));
  ctx.save(); ctx.globalAlpha = enter; ctx.translate(0, (1 - enter) * 20);
  tracked(kicker, 112, 304, 18);
  text(first, 106, 438, 94, colors.cream, true);
  text(second, 106, 544, 94, colors.gold, true, true);
  body.forEach((value, i) => text(value, 112, 637 + i * 44, 29, colors.muted));
  ctx.restore();
}

function sectionAt(time: number): number { return time < 3.5 ? 0 : time < 16.5 ? 1 : time < 28.5 ? 2 : time < 35 ? 3 : time < 41.5 ? 4 : 5; }
function gameTime(time: number, section: number): number {
  if (section === 1) return time - 3.5;
  if (section === 2) return 54 + time - 16.5;
  return Math.min(90, 85 + time - 28.5);
}

function reset(): void {
  run = createRun(SEED); scene.start(); previousVideoTime = -1; lastSection = -1; portraitReady = false; soundtrackEvents = [];
}

function advance(target: number, visible: boolean, videoTime: number): void {
  const targetTick = Math.min(5400, Math.round(target / GAME.step));
  while (run.tick < targetTick && run.phase === 'playing') {
    const events = stepRun(run, trailerSteer(run));
    if (visible) {
      scene.effects(events);
      for (const event of events) soundtrackEvents.push({ time: Math.max(0, videoTime - (target - run.elapsed)), kind: event.kind, value: event.value });
    }
  }
}

function render(time: number): void {
  if (time < previousVideoTime) reset();
  const section = sectionAt(time), delta = Math.min(.1, Math.max(0, time - previousVideoTime));
  if (section >= 1 && section <= 3) {
    const target = gameTime(time, section);
    if (section !== lastSection) {
      advance(target, false, time);
      scene.start();
    } else advance(target, true, time);
    scene.render(run, delta);
  }
  base(time);
  if (section === 0) {
    copy('ONE SEED. MANY CHANCES.', 'Grow a little', 'wilder.', ['A short browser game about', 'the branches you choose to keep.'], time, 0);
    tracked('90 SECONDS TO THE CANOPY', 112, 824, 17, colors.gold, 3);
  } else if (section <= 3) {
    ctx.save(); ctx.beginPath(); ctx.rect(960, 130, 960, 810); ctx.clip();
    ctx.drawImage(scene.app.canvas, 960, 0, 960, H);
    ctx.restore();
    const blend = ctx.createLinearGradient(960, 0, 1180, 0); blend.addColorStop(0, '#0a2528'); blend.addColorStop(1, '#0a252800');
    ctx.fillStyle = blend; ctx.fillRect(960, 130, 220, 810);
    const target = gameTime(time, section);
    if (section === 1 && time < 10) copy('01 / GUIDE TOGETHER', 'One motion.', 'Every branch.', ['Steer left and right.', 'Every living tip moves with you.'], time, 3.5);
    else if (section === 1) copy('01 / BRANCH INTO POSSIBILITY', 'Catch a bud.', 'Grow a chance.', ['More living tips multiply your light.', 'Keep at least one alive.'], time, 10);
    else if (section === 2) copy('02 / LATER IN THE RUN', 'Branch out.', 'Risk more.', ['Every extra tip multiplies your light.', 'Thorns prune the ones they touch.'], time, 16.5);
    else copy('03 / THE FINAL ASCENT', run.phase === 'won' ? 'You found' : 'Follow', 'the light.', ['Reach the canopy.', 'Let your surviving branches bloom.'], time, 28.5);
    tracked('LIGHT GATHERED', 1140, 198, 14, colors.muted, 2);
    text(String(run.score).padStart(4, '0'), 1140, 244, 44, colors.cream, true);
    tracked('LIVING TIPS', 1590, 198, 14, colors.muted, 2);
    text(`${run.tips.length} / 6`, 1590, 244, 44, colors.cream, true);
    tracked(`${run.tips.length}× LIGHT`, 1590, 278, 13, colors.gold, 2);
    line(1140, 892, 608, .25); ctx.fillStyle = colors.gold; ctx.fillRect(1140, 891, 608 * run.height / HEIGHT, 2);
    tracked(`${Math.round(run.height / HEIGHT * 100)}% OF THE CANOPY`, 1140, 933, 14, colors.gold, 2);
    tracked(`GAMEPLAY DEMO / ${Math.floor(target)}s OF 90s`, 1140, 1019, 13, colors.muted, 2);
    line(138, 805, 248, .5);
    ctx.strokeStyle = colors.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(150, 793); ctx.lineTo(138, 805); ctx.lineTo(150, 817);
    ctx.moveTo(374, 793); ctx.lineTo(386, 805); ctx.lineTo(374, 817); ctx.stroke();
    ctx.beginPath(); ctx.arc(262 + trailerSteer(run) * 90, 805, 7, 0, Math.PI * 2); ctx.fillStyle = colors.gold; ctx.fill();
    tracked('ONE MOTION GUIDES EVERY TIP', 112, 859, 13, colors.muted, 2);
  } else if (section === 4) {
    advance(90, false, time);
    if (!portraitReady) { drawPortrait(portrait, run); portraitReady = true; }
    copy('04 / YOUR RUN, PRESERVED', 'Your choices.', 'Your tree.', ['Every branch follows your actual path.', 'Keep your growth portrait.'], time, 35);
    ctx.save(); ctx.translate(1452, 534); ctx.rotate(-.025);
    const scale = 1 + Math.min(1, (time - 35) / 6.5) * .025;
    ctx.scale(scale, scale); ctx.shadowColor = '#001518aa'; ctx.shadowBlur = 65;
    ctx.drawImage(portrait, -285, -348, 570, 697); ctx.restore();
    tracked(`${run.score.toLocaleString()} LIGHT  /  100% CANOPY  /  ${run.peakTips} PEAK TIPS`, 1110, 934, 14, colors.gold, 2);
  } else {
    ctx.save(); ctx.textAlign = 'center';
    text('Boughbound', W / 2, 408, 154, colors.cream, true);
    text('Every branch is a chance.', W / 2, 510, 52, colors.gold, true, true);
    text('Play free in your browser', W / 2, 650, 31, colors.muted);
    ctx.strokeStyle = '#d6c49380'; ctx.strokeRect(550, 704, 820, 104);
    text('boughbound.vercel.app', W / 2, 773, 43, colors.cream);
    ctx.restore();
    tracked('ARROW KEYS  /  A–D  /  TOUCH OR MOUSE DRAG', 558, 877, 15, colors.muted, 2);
  }
  // Gentle fades mark editorial cuts; gameplay excerpts run at normal speed.
  const edges = [0, 3.5, 16.5, 28.5, 35, 41.5, 45];
  const distance = Math.min(...edges.map((edge) => Math.abs(time - edge)));
  if (distance < .22) { ctx.fillStyle = `rgba(6,25,27,${1 - distance / .22})`; ctx.fillRect(0, 0, W, H); }
  previousVideoTime = time; lastSection = section;
}

function showManifest(): void {
  manifest.textContent = JSON.stringify({ title: 'Boughbound — Every branch is a chance', duration: DURATION, width: W, height: H, fps: 30, seed: SEED,
    capture: 'Actual simulation/rendering with scripted input; normal-speed excerpts with labelled time cuts.',
    gameExcerpts: [{ video: [3.5, 16.5], game: [0, 13] }, { video: [16.5, 28.5], game: [54, 66] }, { video: [28.5, 33.5], game: [85, 90] }],
    score: run.score, phase: run.phase, peakTips: run.peakTips, events: soundtrackEvents }, null, 2);
}

async function capture(): Promise<void> {
  record.disabled = true; preview.disabled = true; reset(); render(0);
  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error('This browser has no supported canvas recording format.');
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = () => {
    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: mimeType });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'boughbound-trailer-master.webm';
    link.textContent = `Download recorded master (${(blob.size / 1024 / 1024).toFixed(1)} MB)`;
    document.querySelector('#downloads')!.replaceChildren(link);
    status.textContent = 'Recording complete. Download the master for final MP4 encoding.';
    showManifest(); record.disabled = false; preview.disabled = false;
  };
  recorder.start(1000);
  const began = performance.now(); let lastFrame = -1;
  const frame = (now: number) => {
    const elapsed = Math.min(DURATION, (now - began) / 1000);
    const number = Math.floor(elapsed * 30);
    if (number !== lastFrame) { render(elapsed); lastFrame = number; status.textContent = `Recording ${elapsed.toFixed(1)} / 45 seconds · 1920 × 1080 · 30 fps`; }
    if (elapsed < DURATION) requestAnimationFrame(frame);
    else recorder.stop();
  };
  requestAnimationFrame(frame);
}

async function boot(): Promise<void> {
  await scene.init(document.querySelector<HTMLElement>('#renderer')!);
  scene.app.renderer.resize(960, H, 1);
  scene.title(); scene.render(null, 0);
  background.getContext('2d')!.drawImage(scene.app.canvas, 0, 0, 960, H);
  render(1.5); status.textContent = 'Ready · 45 seconds · 1080p · original game art'; record.disabled = false; preview.disabled = false;
  preview.addEventListener('change', () => { reset(); render(Number(preview.value)); showManifest(); });
  record.addEventListener('click', () => { void capture().catch((error: unknown) => { status.textContent = String(error); record.disabled = false; preview.disabled = false; }); });
}
if (import.meta.env.DEV) void boot().catch((error: unknown) => { status.textContent = String(error); });
