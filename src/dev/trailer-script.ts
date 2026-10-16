import { clamp } from '../game/random';
import type { RunState } from '../game/types';

// A deterministic demonstration controller. It supplies ordinary game input;
// the shipped simulation, rewards, collisions and hazards remain unchanged.
export function trailerSteer(run: RunState): number {
  const next = run.corridors.find((corridor) => corridor.y > run.height - 40);
  if (!next) return 0;
  const center = run.tips.reduce((sum, tip) => sum + tip.x, 0) / run.tips.length;
  return clamp((next.x - center) / 55, -1, 1);
}
