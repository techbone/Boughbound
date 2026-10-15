import { expect, it } from 'vitest';
import { createRun, stepRun } from './simulation';
import { clamp } from './random';

it('keeps generated courses steerable while requiring active play', () => {
  for (const strategy of ['idle', 'corridor']) {
    let wins = 0;
    for (let seed = 0; seed < 100; seed++) {
      const state = createRun(seed);
      while (state.phase === 'playing') {
        const next = state.corridors.find((c) => c.y > state.height - 40);
        const input = strategy === 'idle' || !next ? 0 : clamp((next.x - state.tips[0].x) / 55, -1, 1);
        stepRun(state, input);
      }
      wins += Number(state.phase === 'won');
    }
    expect(wins, strategy).toBe(strategy === 'corridor' ? 100 : 0);
  }
});
