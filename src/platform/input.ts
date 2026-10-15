import { clamp } from '../game/random';

export class Input {
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private origin = 0;
  private drag = 0;
  private dragRange = 60;
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
      event.preventDefault();
      this.dragRange = event.pointerType === 'touch' || event.pointerType === 'pen' ? 28 : 60;
      this.pointerId = event.pointerId; this.origin = event.clientX; this.drag = 0;
      surface.setPointerCapture(event.pointerId);
    });
    surface.addEventListener('pointermove', (event) => {
      if (event.pointerId !== this.pointerId) return;
      event.preventDefault();
      const distance = event.clientX - this.origin;
      this.drag = clamp(distance / this.dragRange, -1, 1);
      // Keep the thumb's neutral point nearby during long swipes, so reversing
      // never requires dragging all the way back to the initial touch position.
      if (Math.abs(distance) > this.dragRange) this.origin = event.clientX - this.drag * this.dragRange;
    });
    const release = (event: PointerEvent) => {
      if (event.pointerId === this.pointerId) this.clear();
    };
    surface.addEventListener('pointerup', release);
    surface.addEventListener('pointercancel', release);
    surface.addEventListener('lostpointercapture', release);
    const preventSelection = (event: Event) => { if (this.enabled) event.preventDefault(); };
    surface.addEventListener('contextmenu', preventSelection);
    surface.addEventListener('selectstart', preventSelection);
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
