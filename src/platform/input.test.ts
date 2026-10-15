import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Input } from './input';

class Surface extends EventTarget {
  captured = new Set<number>();
  setPointerCapture(id: number): void { this.captured.add(id); }
  hasPointerCapture(id: number): boolean { return this.captured.has(id); }
  releasePointerCapture(id: number): void { this.captured.delete(id); }
}

function pointer(surface: Surface, type: string, x: number, pointerType = 'touch', pointerId = 1): Event {
  const event = Object.assign(new Event(type, { cancelable: true }), { clientX: x, pointerType, pointerId, button: 0 });
  surface.dispatchEvent(event);
  return event;
}

describe('steering gestures', () => {
  let surface: Surface;
  let input: Input;
  let keyboard: EventTarget;

  beforeEach(() => {
    keyboard = new EventTarget();
    vi.stubGlobal('window', keyboard);
    surface = new Surface(); input = new Input(surface as unknown as HTMLElement); input.enabled = true;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('responds to a short touch while preserving desktop mouse sensitivity', () => {
    expect(pointer(surface, 'pointerdown', 100).defaultPrevented).toBe(true);
    pointer(surface, 'pointermove', 114);
    expect(input.value()).toBe(.5);
    expect(pointer(surface, 'pointermove', 128).defaultPrevented).toBe(true);
    expect(input.value()).toBe(1);
    pointer(surface, 'pointerup', 128);
    pointer(surface, 'pointerdown', 100, 'mouse');
    pointer(surface, 'pointermove', 130, 'mouse');
    expect(input.value()).toBe(.5);
  });

  it('reverses locally after a long swipe instead of requiring a return to its start', () => {
    pointer(surface, 'pointerdown', 100); pointer(surface, 'pointermove', 400);
    expect(input.value()).toBe(1);
    pointer(surface, 'pointermove', 372);
    expect(input.value()).toBe(0);
    pointer(surface, 'pointermove', 344);
    expect(input.value()).toBe(-1);
  });

  it('ignores a second finger and clears steering on cancellation or lost capture', () => {
    pointer(surface, 'pointerdown', 100); pointer(surface, 'pointermove', 128);
    pointer(surface, 'pointerdown', 300, 'touch', 2); pointer(surface, 'pointermove', 200, 'touch', 2);
    expect(input.value()).toBe(1);
    pointer(surface, 'pointercancel', 128);
    expect(input.value()).toBe(0); expect(surface.captured.size).toBe(0);
    pointer(surface, 'pointerdown', 100); pointer(surface, 'pointermove', 72);
    pointer(surface, 'lostpointercapture', 72);
    expect(input.value()).toBe(0);
  });

  it('retains keyboard steering and releases held input on blur', () => {
    keyboard.dispatchEvent(Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowRight' }));
    expect(input.value()).toBe(1);
    keyboard.dispatchEvent(new Event('blur'));
    expect(input.value()).toBe(0);
    pointer(surface, 'pointerdown', 100); pointer(surface, 'pointermove', 72);
    keyboard.dispatchEvent(new Event('blur'));
    expect(input.value()).toBe(0);
  });

  it('suppresses selection and callouts only during active play', () => {
    for (const type of ['selectstart', 'contextmenu']) {
      const event = new Event(type, { cancelable: true }); surface.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
    input.enabled = false;
    const event = new Event('contextmenu', { cancelable: true }); surface.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
