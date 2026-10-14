import { HEIGHT } from '../config';
import { randomFromSeed } from '../game/random';
import type { RunState } from '../game/types';

export function drawPortrait(canvas: HTMLCanvasElement, state: RunState): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Portrait canvas is unavailable.');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const paper = ctx.createLinearGradient(0, 0, w, h);
  paper.addColorStop(0, '#e9e2c9'); paper.addColorStop(1, '#cfc8ab');
  ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
  const random = randomFromSeed(state.seed);
  ctx.fillStyle = '#26423709';
  for (let i = 0; i < 9000; i++) ctx.fillRect(random() * w, random() * h, random() * 2 + .5, .8);
  ctx.strokeStyle = '#3d514c38'; ctx.lineWidth = 1; ctx.strokeRect(38, 38, w - 76, h - 76);
  ctx.fillStyle = '#37534b'; ctx.font = '15px Arial'; ctx.textAlign = 'left';
  ctx.fillText('B O U G H B O U N D', 72, 90);
  ctx.textAlign = 'right'; ctx.font = '12px Arial'; ctx.fillText('GROWTH STUDY / ' + state.seed.toString(16).toUpperCase().slice(0, 8), w - 72, 90);
  ctx.beginPath(); ctx.moveTo(72, 120); ctx.lineTo(w - 72, 120); ctx.stroke();
  const points = state.branches.flatMap((b) => b.path);
  const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
  const sx = Math.min(2.4, (w - 200) / Math.max(80, maxX - minX));
  const sy = (h - 360) / Math.max(180, state.height);
  const project = (x: number, y: number) => ({ x: w / 2 + (x - (minX + maxX) / 2) * sx, y: h - 210 - y * sy });
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const branch of state.branches) {
    if (branch.path.length < 2) continue;
    ctx.beginPath();
    branch.path.forEach((point, i) => { const p = project(point.x, point.y); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.strokeStyle = branch.status === 'withered' ? '#8c7963' : '#35594b';
    ctx.lineWidth = Math.max(1.4, 8 / (1 + branch.depth * .42)); ctx.stroke();
    const end = branch.path[branch.path.length - 1]; const p = project(end.x, end.y);
    if (branch.status !== 'forked') {
      const petals = branch.status === 'withered' ? 3 : 7;
      for (let i = 0; i < petals; i++) {
        const angle = i / petals * Math.PI * 2;
        ctx.save(); ctx.translate(p.x + Math.cos(angle) * 7, p.y + Math.sin(angle) * 7); ctx.rotate(angle);
        ctx.fillStyle = branch.status === 'withered' ? '#b8a789' : '#a79e57';
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#ded19d'; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    // Small paired leaves follow actual path points, never replace the branch geometry.
    const stride = Math.max(10, Math.ceil(branch.path.length / 12));
    for (let i = stride; i < branch.path.length - 1; i += stride) {
      const q = project(branch.path[i].x, branch.path[i].y); const side = i % 2 ? -1 : 1;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(side * -.7);
      ctx.fillStyle = branch.status === 'withered' ? '#a4947780' : '#65806599';
      ctx.beginPath(); ctx.ellipse(side * 8, -3, 12, 4, -.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  const root = project(240, 0);
  ctx.strokeStyle = '#64715980'; ctx.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(root.x, root.y); ctx.quadraticCurveTo(root.x + i * 8, root.y + 13, root.x + i * 17, root.y + 23 + Math.abs(i) * 3); ctx.stroke();
  }
  ctx.strokeStyle = '#3d514c38'; ctx.beginPath(); ctx.moveTo(72, h - 145); ctx.lineTo(w - 72, h - 145); ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = '#304d42'; ctx.font = 'italic 31px Georgia';
  ctx.fillText(state.phase === 'won' ? 'A little closer to the sun.' : 'Every branch was a chance.', 72, h - 96);
  ctx.font = '13px Arial'; ctx.fillStyle = '#62715c';
  ctx.fillText(`${state.score.toLocaleString()} LIGHT   ·   ${Math.round(state.height / HEIGHT * 100)}% CANOPY   ·   ${state.peakTips} TIPS`, 72, h - 62);
}

export async function downloadPortrait(canvas: HTMLCanvasElement, seed: number): Promise<void> {
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('PNG export failed.')), 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `boughbound-${seed.toString(16)}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
