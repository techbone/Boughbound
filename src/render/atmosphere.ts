import { Texture } from 'pixi.js';
import { randomFromSeed } from '../game/random';

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  const ctx = c.getContext('2d'); if (!ctx) throw new Error('Canvas rendering is unavailable.');
  return [c, ctx];
}

export function glowTexture(): Texture {
  const [c, ctx] = canvas(128, 128);
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(.12, '#ffffffc0');
  gradient.addColorStop(.4, '#ffffff35'); gradient.addColorStop(1, '#ffffff00');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128); return Texture.from(c);
}

export function forestTexture(warm = false): Texture {
  const [c, ctx] = canvas(1600, 1100); const random = randomFromSeed(6249);
  const sky = ctx.createLinearGradient(0, 0, 0, 1100);
  sky.addColorStop(0, warm ? '#637665' : '#123e40');
  sky.addColorStop(.5, warm ? '#426454' : '#164544');
  sky.addColorStop(1, '#081f24'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1600, 1100);
  for (let layer = 0; layer < 4; layer++) {
    const ground = 680 + layer * 115;
    ctx.fillStyle = ['#6a8e7120', '#32675b55', '#1c4945aa', '#0b2c2cff'][layer];
    for (let tree = 0; tree < 17; tree++) {
      const x = tree * 120 + random() * 100 - 70;
      const height = 200 + random() * 550; const width = 9 + random() * 12;
      ctx.beginPath(); ctx.moveTo(x - width, ground + 100); ctx.lineTo(x - width * .28, ground - height);
      ctx.lineTo(x + width * .28, ground - height); ctx.lineTo(x + width, ground + 100); ctx.fill();
      for (let j = 0; j < 9; j++) {
        const y = ground - height + j * height / 11;
        const spread = 25 + j * 10; const sign = j % 2 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(x, y + 50); ctx.quadraticCurveTo(x + sign * spread * .5, y + 20, x + sign * spread, y - 15);
        ctx.lineTo(x, y + 57); ctx.fill();
      }
    }
    ctx.beginPath(); ctx.moveTo(0, 1100); ctx.lineTo(0, ground);
    for (let x = 0; x <= 1600; x += 20) ctx.lineTo(x, ground + Math.sin(x / 230 + layer) * 50 + Math.cos(x / 100) * 15);
    ctx.lineTo(1600, 1100); ctx.closePath(); ctx.fill();
  }
  // Ground ferns and grasses frame the illustration without crossing its controls.
  ctx.strokeStyle = '#57726135'; ctx.lineWidth = 1;
  for (let i = 0; i < 230; i++) {
    const x = random() * 1600, y = 970 + random() * 150, height = 10 + random() * 90;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - height / 2, x + random() * 40 - 20, y - height); ctx.stroke();
  }
  const vignette = ctx.createRadialGradient(1050, 420, 80, 800, 550, 950);
  vignette.addColorStop(0, '#001b2000'); vignette.addColorStop(1, '#00171eaa');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1600, 1100);
  return Texture.from(c);
}

export function specimenTexture(): Texture {
  const [c, ctx] = canvas(850, 1000); const random = randomFromSeed(613);
  ctx.lineCap = 'round';
  function branch(x: number, y: number, length: number, angle: number, width: number, depth: number): void {
    const ex = x + Math.sin(angle) * length, ey = y - Math.cos(angle) * length;
    const bend = (random() - .5) * length * .35;
    const gradient = ctx.createLinearGradient(x, y, ex, ey);
    gradient.addColorStop(0, '#837d53'); gradient.addColorStop(1, '#dfd1a1');
    ctx.strokeStyle = gradient; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + bend, y - length * .42, ex - bend, ey + length * .22, ex, ey); ctx.stroke();
    if (depth > 0) {
      branch(ex, ey, length * (.68 + random() * .12), angle - .28 - random() * .3, width * .68, depth - 1);
      branch(ex, ey, length * (.68 + random() * .12), angle + .28 + random() * .3, width * .65, depth - 1);
      if (depth === 3) branch(x + (ex - x) * .62, y + (ey - y) * .62, length * .7, angle - .65, width * .45, depth - 2);
    } else {
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.translate(ex + (random() - .5) * 13, ey + (random() - .5) * 10);
        ctx.rotate(angle + (i - 1) * .8);
        ctx.fillStyle = ['#d7d8a6aa', '#b4c99599', '#dfd39a99'][i];
        ctx.beginPath(); ctx.ellipse(0, -6, 3.5, 10, -.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
  }
  branch(425, 910, 235, .03, 19, 6);
  ctx.strokeStyle = '#9b997160'; ctx.lineWidth = 2;
  for (let i = -5; i <= 5; i++) {
    ctx.beginPath(); ctx.moveTo(425, 910); ctx.bezierCurveTo(425 + i * 5, 930, 425 + i * 16, 935, 425 + i * 25, 950 + Math.abs(i) * 2); ctx.stroke();
  }
  return Texture.from(c);
}
