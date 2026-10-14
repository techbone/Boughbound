import { describe, expect, it } from 'vitest';
import { GAME, HEIGHT } from '../config';
import { makeCourse } from './course';
import { createRun, segmentHitsCircle, stepRun } from './simulation';
import type { Entity } from './types';
const pickup = (kind: Entity['kind'], id = 0): Entity => ({ id, kind, x: 240, y: 1, radius: 12, consumed: false });

describe('branching simulation', () => {
  it('reproduces a seeded run and input stream', () => {
    const a = createRun(731); const b = createRun(731);
    for (let i = 0; i < 5400; i++) { const input = Math.sin(i / 80) * 0.4; stepRun(a, input); stepRun(b, input); }
    expect(a).toEqual(b);
  });
  it('forks at one connected point and consumes the bud once', () => {
    const state = createRun(1); state.entities = [pickup('fork')]; stepRun(state, 0);
    expect(state.tips).toHaveLength(2); expect(state.branches[0].status).toBe('forked');
    for (const branch of state.branches.slice(1)) { expect(branch.parent).toBe(0); expect(branch.path[0]).toEqual(state.branches[0].path.at(-1)); }
    stepRun(state, 0); expect(state.forks).toBe(1);
  });
  it('caps live tips and turns excess buds into score', () => {
    const state = createRun(2);
    for (let i = 0; i < 8; i++) { const tip = state.tips[0]; state.entities = [{ ...pickup('fork', i), x: tip.x, y: tip.y + 1 }]; stepRun(state, 0); }
    expect(state.tips).toHaveLength(GAME.maxTips); expect(state.peakTips).toBe(GAME.maxTips);
    expect(state.forks).toBe(5); expect(state.score).toBeGreaterThan(0);
  });
  it('lets one branch survive another being pruned', () => {
    const state = createRun(3); state.entities = [pickup('fork')]; stepRun(state, 0); state.entities = [];
    for (let i = 0; i < 70; i++) stepRun(state, 0);
    state.entities = [{ ...pickup('thorn'), x: state.tips[0].x, y: state.height + 1, radius: 8 }]; stepRun(state, 0);
    expect(state.tips).toHaveLength(1); expect(state.phase).toBe('playing'); expect(state.branches.some((b) => b.status === 'withered')).toBe(true);
  });
  it('resolves fatal collision before a simultaneous reward, then stops', () => {
    const state = createRun(4); state.entities = [pickup('fork'), pickup('thorn', 1)]; stepRun(state, 0);
    expect(state.phase).toBe('lost'); expect(state.forks).toBe(0); const saved = JSON.stringify(state);
    expect(stepRun(state, 1)).toEqual([]); expect(JSON.stringify(state)).toBe(saved);
  });
  it('collects overlapping light only once across tips', () => {
    const state = createRun(5); state.entities = [pickup('fork')]; stepRun(state, 0);
    state.entities = [pickup('light', 1)]; stepRun(state, 0); expect(state.light).toBe(1); expect(state.score).toBe(20);
  });
  it('detects a swept hit with both endpoints outside', () => {
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 0 }, 5)).toBe(true);
    expect(segmentHitsCircle({ x: 0, y: 10 }, { x: 100, y: 10 }, { x: 50, y: 0 }, 5)).toBe(false);
  });
  it('ends at the canopy and awards completion once', () => {
    const state = createRun(6); state.entities = [];
    for (let i = 0; i < 6000; i++) stepRun(state, NaN);
    expect(state.phase).toBe('won'); expect(state.height).toBe(HEIGHT); expect(state.elapsed).toBe(GAME.duration);
    expect(state.score).toBe(650); expect(state.branches[0].status).toBe('bloomed'); expect(state.branches[0].path.length).toBeLessThan(1400);
  });
  it('keeps positions finite and bounded across seeds', () => {
    for (let seed = 0; seed < 60; seed++) {
      const state = createRun(seed);
      for (let tick = 0; tick < 5500 && state.phase === 'playing'; tick++) stepRun(state, Math.sin(tick * .014 + seed));
      expect(state.phase).not.toBe('playing'); expect(state.tips.length).toBeLessThanOrEqual(GAME.maxTips);
      for (const branch of state.branches) for (const point of branch.path) {
        expect(Number.isFinite(point.x + point.y)).toBe(true); expect(point.x).toBeGreaterThanOrEqual(15); expect(point.x).toBeLessThanOrEqual(GAME.width - 15);
      }
    }
  });
});
describe('course fairness', () => {
  it('has a safe introduction and reachable corridor shifts', () => {
    for (let seed = 0; seed < 200; seed++) {
      const { entities, corridors } = makeCourse(seed);
      expect(entities.filter((e) => e.kind === 'thorn').every((e) => e.y >= 680)).toBe(true);
      for (let i = 0; i < corridors.length; i++) {
        const c = corridors[i]; expect(c.halfWidth).toBeGreaterThan(60);
        const row = entities.filter((e) => e.kind === 'thorn' && Math.abs(e.y - c.y) <= 15);
        expect(row.every((e) => Math.abs(e.x - c.x) > c.halfWidth + e.radius + GAME.tipRadius)).toBe(true);
        if (i > 0) { const p = corridors[i - 1]; expect(Math.abs(c.x - p.x)).toBeLessThan((c.y - p.y) / GAME.ascentSpeed * GAME.steerSpeed * .3); }
      }
    }
  });
});
