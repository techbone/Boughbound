import { clamp } from '../game/random';

export class Input {
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private origin = 0;
  private drag = 0;
  enabled = false;

  constructor(private surface: HTMLElement) {
    window.addEventListener('keydown', (event) => {
      if (!this.enabled || !['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(event.key)) return;
      event.preventDefault(); this.keys.add(event.key.toLowerCase());
    });
    window.addEventListener('keyup', (event) => this.keys.delete(event.key.toLowerCase()));
    window.addEventListener('blur', () => this.clear());
    surface.addEventListener('pointerdown', (event) => {
      if (!this.enabled || this.pointerId !== null || event.button !== 0) return;
      this.pointerId = event.pointerId; this.origin = event.clientX; this.drag = 0;
      surface.setPointerCapture(event.pointerId);
    });
    surface.addEventListener('pointermove', (event) => {
      if (event.pointerId === this.pointerId) this.drag = clamp((event.clientX - this.origin) / 60, -1, 1);
    });
    const release = (event: PointerEvent) => {
      if (event.pointerId === this.pointerId) this.clear();
    };
    surface.addEventListener('pointerup', release);
    surface.addEventListener('pointercancel', release);
    surface.addEventListener('lostpointercapture', release);
  }

  value(): number {
    if (!this.enabled) return 0;
    const key = Number(this.keys.has('arrowright') || this.keys.has('d')) - Number(this.keys.has('arrowleft') || this.keys.has('a'));
    return key || this.drag;
  }

  clear(): void {
    this.keys.clear(); this.drag = 0;
    const id = this.pointerId; this.pointerId = null;
    if (id !== null && this.surface.hasPointerCapture(id)) this.surface.releasePointerCapture(id);
  }
}
