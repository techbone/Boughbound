import { GAME, HEIGHT } from '../config';
import { makeCourse } from './course';
import { clamp } from './random';
import type { Branch, Entity, GameEvent, Point, RunState, Tip } from './types';

export function createRun(seed: number): RunState {
  return {
    seed: seed >>> 0, tick: 0, elapsed: 0, height: 0, phase: 'playing',
    tips: [{ id: 0, branchId: 0, x: 240, y: 0, vx: 0, impulse: 0 }],
    branches: [{ id: 0, parent: null, depth: 0, path: [{ x: 240, y: 0 }], status: 'growing' }],
    ...makeCourse(seed), score: 0, light: 0, forks: 0, lost: 0, peakTips: 1, nextTipId: 1,
  };
}

export function segmentHitsCircle(a: Point, b: Point, c: Point, radius: number): boolean {
  const dx = b.x - a.x; const dy = b.y - a.y;
  const denominator = dx * dx + dy * dy;
  const t = denominator === 0 ? 0 : clamp(((c.x - a.x) * dx + (c.y - a.y) * dy) / denominator, 0, 1);
  return (a.x + dx * t - c.x) ** 2 + (a.y + dy * t - c.y) ** 2 <= radius ** 2;
}

function appendEnd(branch: Branch, tip: Tip): void {
  const last = branch.path[branch.path.length - 1];
  if (last.x !== tip.x || last.y !== tip.y) branch.path.push({ x: tip.x, y: tip.y });
}

function splitTip(state: RunState, tip: Tip): void {
  const parent = state.branches[tip.branchId];
  appendEnd(parent, tip); parent.status = 'forked';
  state.tips = state.tips.filter((t) => t.id !== tip.id);
  for (const sign of [-1, 1]) {
    const branchId = state.branches.length;
    state.branches.push({ id: branchId, parent: parent.id, depth: parent.depth + 1, path: [{ x: tip.x, y: tip.y }], status: 'growing' });
    state.tips.push({ id: state.nextTipId++, branchId, x: tip.x, y: tip.y, vx: tip.vx, impulse: sign * 65 });
  }
  state.forks++; state.peakTips = Math.max(state.peakTips, state.tips.length);
}

export function stepRun(state: RunState, input: number): GameEvent[] {
  if (state.phase !== 'playing') return [];
  const events: GameEvent[] = [];
  const steer = Number.isFinite(input) ? clamp(input, -1, 1) : 0;
  state.tick++; state.elapsed = state.tick * GAME.step;
  state.height = Math.min(HEIGHT, state.elapsed * GAME.ascentSpeed);
  const nearby = state.entities.filter((e) => !e.consumed && Math.abs(e.y - state.height) < 70);
  const swept: { tip: Tip; previous: Point }[] = [];
  for (const tip of state.tips) {
    const previous = { x: tip.x, y: tip.y };
    tip.vx += (steer * GAME.steerSpeed - tip.vx) * 0.13;
    tip.x = clamp(tip.x + (tip.vx + tip.impulse) * GAME.step, 15, GAME.width - 15);
    tip.y = state.height; tip.impulse *= 0.987;
    const hit = nearby.some((e) => e.kind === 'thorn' && segmentHitsCircle(previous, tip, e, e.radius * 0.85 + GAME.tipRadius));
    if (hit) {
      const branch = state.branches[tip.branchId]; appendEnd(branch, tip); branch.status = 'withered';
      state.lost++; events.push({ kind: 'prune', x: tip.x, y: tip.y, value: 0 });
    } else {
      swept.push({ tip, previous });
      if (state.tick % GAME.pathInterval === 0) appendEnd(state.branches[tip.branchId], tip);
    }
  }
  state.tips = swept.map(({ tip }) => tip);
  for (const entity of nearby) {
    if (entity.kind === 'thorn') continue;
    const collector = swept.find(({ tip, previous }) => state.tips.includes(tip) && segmentHitsCircle(previous, tip, entity, entity.radius + GAME.tipRadius));
    if (collector) collect(state, collector.tip, entity, events);
  }
  if (state.tips.length === 0) {
    state.phase = 'lost'; events.push({ kind: 'lose', x: 240, y: state.height, value: state.score });
  } else if (state.height >= HEIGHT) {
    state.phase = 'won'; const bonus = 500 + state.tips.length * 150; state.score += bonus;
    for (const tip of state.tips) { appendEnd(state.branches[tip.branchId], tip); state.branches[tip.branchId].status = 'bloomed'; }
    events.push({ kind: 'win', x: 240, y: state.height, value: bonus });
  }
  return events;
}

function collect(state: RunState, tip: Tip, entity: Entity, events: GameEvent[]): void {
  entity.consumed = true;
  if (entity.kind === 'fork' && state.tips.length < GAME.maxTips) {
    splitTip(state, tip); events.push({ kind: 'fork', x: entity.x, y: entity.y, value: state.tips.length }); return;
  }
  const value = (entity.kind === 'fork' ? 50 : 10) * state.tips.length;
  state.score += value; state.light++;
  events.push({ kind: 'light', x: entity.x, y: entity.y, value });
}
