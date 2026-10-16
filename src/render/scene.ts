import { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import { GAME, HEIGHT } from '../config';
import { randomFromSeed } from '../game/random';
import type { GameEvent, RunState } from '../game/types';
import { forestTexture, glowTexture, specimenTexture } from './atmosphere';

interface Chunk { graphic: Graphics; min: number; max: number; count: number }
interface Spark { sprite: Sprite; x: number; y: number; vx: number; vy: number; life: number; maxLife: number }
interface Floater { text: Text; x: number; y: number; life: number }

export class ForestScene {
  readonly app = new Application();
  private background!: Sprite;
  private morning!: Sprite;
  private sun!: Sprite;
  private specimen!: Sprite;
  private world = new Container();
  private wood = new Container();
  private objects = new Graphics();
  private live = new Graphics();
  private bloom = new Graphics();
  private bloomTime = 0;
  private bounds = new Graphics();
  private arenaMask = new Graphics();
  private particles = new Container();
  private ambient = new Graphics();
  private chunks: Chunk[] = [];
  private pathCounts = new Map<number, number>();
  private sparks: Spark[] = [];
  private floaters: Floater[] = [];
  private glow!: ReturnType<typeof glowTexture>;
  private mode: 'title' | 'game' = 'title';
  private viewportScale = 1;
  private clock = 0;
  private pollen: { x: number; y: number; size: number; speed: number }[] = [];
  private needsDraw = true;
  private lastTick = -1;
  reduced = false;

  async init(element: HTMLElement): Promise<void> {
    await this.app.init({ resizeTo: element, preference: 'webgl', backgroundAlpha: 1, backgroundColor: '#0d2828',
      antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, autoStart: false });
    element.appendChild(this.app.canvas);
    this.glow = glowTexture();
    this.background = new Sprite(forestTexture()); this.morning = new Sprite(forestTexture(true));
    this.sun = new Sprite(this.glow); this.sun.anchor.set(.5); this.sun.tint = 0xdccc92;
    this.specimen = new Sprite(specimenTexture()); this.specimen.anchor.set(.5, 1);
    this.app.stage.addChild(this.background, this.morning, this.sun, this.ambient, this.specimen, this.bounds, this.world, this.arenaMask);
    this.world.mask = this.arenaMask;
    this.world.addChild(this.wood, this.objects, this.live, this.bloom, this.particles);
    this.world.visible = false;
    const random = randomFromSeed(38);
    this.pollen = Array.from({ length: 65 }, () => ({ x: random(), y: random(), size: .5 + random() * 1.3, speed: .002 + random() * .006 }));
    window.addEventListener('resize', () => { this.needsDraw = true; });
  }

  title(): void { this.mode = 'title'; this.world.visible = false; this.specimen.visible = true; this.bounds.clear(); }

  start(): void {
    this.mode = 'game'; this.world.visible = true; this.specimen.visible = false;
    for (const child of this.wood.removeChildren()) child.destroy();
    for (const child of this.particles.removeChildren()) child.destroy();
    this.chunks = []; this.pathCounts.clear(); this.sparks = []; this.floaters = []; this.lastTick = -1; this.needsDraw = true;
    this.bloom.clear(); this.bloomTime = 0;
  }

  effects(events: GameEvent[]): void {
    for (const event of events) {
      if (event.kind === 'win' || event.kind === 'lose') continue;
      const color = event.kind === 'prune' ? 0xd58d76 : event.kind === 'fork' ? 0xe6cb82 : 0xc9e7c2;
      const count = this.reduced ? 2 : event.kind === 'fork' ? 18 : 8;
      for (let i = 0; i < count && this.sparks.length < 100; i++) {
        const sprite = new Sprite(this.glow); sprite.anchor.set(.5); sprite.tint = color; sprite.width = sprite.height = 9;
        this.particles.addChild(sprite);
        const angle = Math.PI * 2 * i / count; const speed = 16 + (i % 4) * 8;
        this.sparks.push({ sprite, x: event.x, y: -event.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .7, maxLife: .7 });
      }
      if (event.kind === 'light' && this.floaters.length < 12) {
        const text = new Text({ text: `+${event.value}`, style: { fontFamily: 'Georgia', fontSize: 14, fill: 0xe9e3b8 } });
        text.anchor.set(.5); this.particles.addChild(text); this.floaters.push({ text, x: event.x, y: -event.y - 15, life: .8 });
      }
    }
  }

  render(state: RunState | null, delta: number): void {
    this.clock += this.reduced ? 0 : delta;
    const width = this.app.screen.width, height = this.app.screen.height;
    for (const sprite of [this.background, this.morning]) { sprite.width = width; sprite.height = height; }
    const progress = this.mode === 'game' && state ? state.height / HEIGHT : 0;
    this.morning.alpha = progress * .85;
    this.sun.position.set(width * (width < 600 ? .78 : .7), height * (.29 - progress * .08));
    this.sun.width = this.sun.height = Math.max(220, Math.min(width * .48, 700)); this.sun.alpha = .15 + progress * .24;
    const treeHeight = height * (width < 600 ? .59 : .76);
    this.specimen.height = treeHeight; this.specimen.width = treeHeight * .85;
    this.specimen.position.set(width * (width < 600 ? .79 : .71), height * .84);
    this.specimen.alpha = width < 850 ? .4 : .94;
    this.ambient.clear();
    if (!this.reduced) for (const mote of this.pollen) {
      const x = ((mote.x + Math.sin(this.clock * .15 + mote.y * 40) * .006) % 1) * width;
      const y = ((mote.y - this.clock * mote.speed) % 1 + 1) % 1 * height;
      this.ambient.circle(x, y, mote.size).fill({ color: 0xd4dfb0, alpha: .16 + Math.sin(this.clock + mote.x * 20) * .08 });
    }
    if (this.mode === 'game' && state) {
      // Same world view on all aspect ratios; unused sides are decorative forest.
      const short = height < 560;
      const top = short ? 110 : 150;
      const bottom = short ? 65 : 110;
      const scale = Math.min((width - 26) / GAME.width, Math.max(100, height - top - bottom) / GAME.viewHeight);
      if (scale !== this.viewportScale) { this.needsDraw = true; this.viewportScale = scale; }
      const anchor = top + GAME.viewHeight * .82 * scale;
      this.world.scale.set(scale); this.world.position.set((width - GAME.width * scale) / 2, anchor + state.height * scale);
      this.bounds.clear();
      const left = this.world.x, right = left + GAME.width * scale;
      const floor = top + GAME.viewHeight * scale;
      this.arenaMask.clear().rect(left - 5, top, GAME.width * scale + 10, floor - top).fill(0xffffff);
      this.bounds.moveTo(left, top).lineTo(left, floor).stroke({ color: 0x9eb592, alpha: .09, width: 1 });
      this.bounds.moveTo(right, top).lineTo(right, floor).stroke({ color: 0x9eb592, alpha: .09, width: 1 });
      if (state.tick !== this.lastTick || this.needsDraw) {
        this.drawPaths(state); this.drawEntities(state); this.drawTips(state); this.lastTick = state.tick; this.needsDraw = false;
      }
      this.updateParticles(delta);
      if (state.phase === 'won') {
        this.bloomTime += delta;
        this.drawBloom(state);
      }
    }
    this.app.render();
  }

  private drawPaths(state: RunState): void {
    for (const branch of state.branches) {
      const start = Math.max(1, this.pathCounts.get(branch.id) || 1);
      for (let i = start; i < branch.path.length; i++) {
        let chunk = this.chunks[this.chunks.length - 1];
        if (!chunk || chunk.count >= 96) {
          chunk = { graphic: new Graphics(), min: Infinity, max: -Infinity, count: 0 };
          this.chunks.push(chunk); this.wood.addChild(chunk.graphic);
        }
        const a = branch.path[i - 1], b = branch.path[i];
        const lineWidth = Math.max(1.4, 5.4 / (1 + branch.depth * .22));
        chunk.graphic.moveTo(a.x, -a.y).lineTo(b.x, -b.y).stroke({ color: 0x788d68, width: lineWidth + 3, alpha: .16 });
        chunk.graphic.moveTo(a.x, -a.y).lineTo(b.x, -b.y).stroke({ color: 0xd4c28a, width: lineWidth, alpha: .85 });
        chunk.count++; chunk.min = Math.min(chunk.min, a.y); chunk.max = Math.max(chunk.max, b.y);
      }
      this.pathCounts.set(branch.id, branch.path.length);
    }
    for (const chunk of this.chunks) chunk.graphic.visible = chunk.max > state.height - 230 && chunk.min < state.height + GAME.viewHeight;
  }

  private drawTips(state: RunState): void {
    const g = this.live; g.clear();
    for (const tip of state.tips) {
      const branch = state.branches[tip.branchId]; const last = branch.path[branch.path.length - 1];
      g.moveTo(last.x, -last.y).lineTo(tip.x, -tip.y).stroke({ color: 0xe4d59e, width: Math.max(1.4, 5.4 / (1 + branch.depth * .22)) });
      g.circle(tip.x, -tip.y, 19).fill({ color: 0xe4d59e, alpha: .035 });
      g.circle(tip.x, -tip.y, 11).fill({ color: 0xe4d59e, alpha: .09 });
      g.ellipse(tip.x, -tip.y, 4, 7).fill(0xf4edc0);
      g.moveTo(tip.x, -tip.y + 8).quadraticCurveTo(tip.x - 14, -tip.y + 4, tip.x - 9, -tip.y - 3).quadraticCurveTo(tip.x - 2, -tip.y - 2, tip.x, -tip.y + 8).fill({ color: 0xb3ce9c, alpha: .85 });
    }
  }

  private drawBloom(state: RunState): void {
    const g = this.bloom; g.clear();
    const opening = this.reduced ? 1 : 1 - (1 - Math.min(1, this.bloomTime / 1.4)) ** 3;
    for (const tip of state.tips) {
      const x = tip.x, y = -tip.y;
      g.circle(x, y, 42 * opening).fill({ color: 0xf1dba0, alpha: .07 });
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;
        const side = 7 * opening, reach = 25 * opening;
        const dx = Math.cos(angle), dy = Math.sin(angle);
        g.moveTo(x, y)
          .quadraticCurveTo(x + dx * reach * .65 - dy * side, y + dy * reach * .65 + dx * side, x + dx * reach, y + dy * reach)
          .quadraticCurveTo(x + dx * reach * .65 + dy * side, y + dy * reach * .65 - dx * side, x, y)
          .fill({ color: 0xe7d49a, alpha: .85 });
      }
      g.circle(x, y, 4).fill(0xfff1c6);
    }
  }

  private drawEntities(state: RunState): void {
    const g = this.objects; g.clear();
    for (const entity of state.entities) {
      if (entity.consumed || entity.y < state.height - 120 || entity.y > state.height + GAME.viewHeight + 100) continue;
      const x = entity.x, y = -entity.y, r = entity.radius;
      if (entity.kind === 'thorn') {
        g.circle(x, y, r * 1.2).fill({ color: 0xe29783, alpha: .045 });
        for (let i = 0; i < 7; i++) {
          const angle = i * Math.PI * 2 / 7 + entity.id * .4;
          const bx = x + Math.cos(angle) * r, by = y + Math.sin(angle) * r;
          g.moveTo(x + Math.cos(angle - .7) * r * .55, y + Math.sin(angle - .7) * r * .55);
          g.lineTo(bx, by).lineTo(x + Math.cos(angle + .7) * r * .55, y + Math.sin(angle + .7) * r * .55).closePath().fill({ color: 0xa37069, alpha: .9 });
        }
        g.circle(x, y, r * .57).fill(0x342f32).stroke({ color: 0xc3927c, width: 1.1, alpha: .7 });
        g.moveTo(x - r * .2, y).lineTo(x + r * .2, y).stroke({ color: 0xc3927c, width: 1, alpha: .5 });
      } else if (entity.kind === 'fork') {
        g.circle(x, y, 24).fill({ color: 0xe8c981, alpha: .06 });
        g.circle(x, y, 15).stroke({ color: 0xe8c981, width: 1, alpha: .6 });
        g.moveTo(x, y + 7).lineTo(x, y).lineTo(x - 6, y - 6).moveTo(x, y).lineTo(x + 6, y - 6).stroke({ color: 0xf1dba0, width: 2 });
        g.circle(x - 6, y - 7, 2).fill(0xf1dba0); g.circle(x + 6, y - 7, 2).fill(0xf1dba0);
      } else {
        g.circle(x, y, 16).fill({ color: 0xc7e8bf, alpha: .055 });
        g.moveTo(x, y - 6).quadraticCurveTo(x + 7, y, x, y + 6).quadraticCurveTo(x - 7, y, x, y - 6).fill(0xc7e8bf);
      }
    }
    // A visible finish line makes the final ascent a destination, not a timer expiring.
    if (state.height > HEIGHT - GAME.viewHeight) {
      g.moveTo(20, -HEIGHT).lineTo(GAME.width - 20, -HEIGHT).stroke({ color: 0xefdc9d, width: 1.5, alpha: .7 });
      g.circle(240, -HEIGHT, 28).stroke({ color: 0xefdc9d, width: 1, alpha: .5 });
    }
  }

  private updateParticles(delta: number): void {
    this.sparks = this.sparks.filter((p) => {
      p.life -= delta;
      if (p.life <= 0) { p.sprite.destroy(); return false; }
      p.x += p.vx * delta; p.y += p.vy * delta; p.sprite.position.set(p.x, p.y); p.sprite.alpha = p.life / p.maxLife; return true;
    });
    this.floaters = this.floaters.filter((p) => {
      p.life -= delta; if (p.life <= 0) { p.text.destroy(); return false; }
      p.y -= delta * 22; p.text.position.set(p.x, p.y); p.text.alpha = Math.min(1, p.life * 2); return true;
    });
  }
}
