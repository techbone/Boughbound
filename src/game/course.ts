import { GAME, HEIGHT } from '../config';
import { clamp, randomFromSeed } from './random';
import type { Corridor, Entity } from './types';

export function makeCourse(seed: number): { entities: Entity[]; corridors: Corridor[] } {
  const random = randomFromSeed(seed);
  const entities: Entity[] = [];
  const corridors: Corridor[] = [];
  let id = 0;
  const add = (kind: Entity['kind'], x: number, y: number, radius: number) => {
    entities.push({ id: id++, kind, x, y, radius, consumed: false });
  };
  // Teach collection and forking before introducing a lethal obstacle.
  for (let y = 90; y <= 210; y += 40) add('light', 240, y, 11);
  add('fork', 240, 290, 18);
  add('light', 200, 400, 11); add('light', 280, 400, 11);
  add('light', 172, 490, 11); add('light', 308, 490, 11);
  let center = 240;
  let row = 0;
  for (let y = 690; y < HEIGHT - 250; y += 250) {
    center = clamp(center + (random() - 0.5) * 140, 132, GAME.width - 132);
    const halfWidth = 100 - y / HEIGHT * 34;
    corridors.push({ x: center, y, halfWidth });
    for (let x = 32; x < GAME.width - 15; x += 59) {
      const radius = 22 + random() * 6;
      if (Math.abs(x - center) > halfWidth + radius + GAME.tipRadius) {
        add('thorn', x, y + (row % 2 ? 10 : -10), radius);
      }
    }
    const side = row % 2 ? -1 : 1;
    for (let i = 0; i < 3; i++) add('light', center + side * (i - 1) * 32, y - 92 + i * 34, 11);
    if (row % 2 === 0) add('fork', center + side * 36, y + 110, 16);
    if (row > 3) add('light', center - side * (halfWidth - 16), y + 72, 11);
    row++;
  }
  entities.sort((a, b) => a.y - b.y || a.id - b.id);
  return { entities, corridors };
}
