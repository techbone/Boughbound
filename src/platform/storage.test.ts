import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readPreferences, savePreferences } from './storage';

describe('local progress resilience', () => {
  const records = new Map<string, string>();
  beforeEach(() => {
    records.clear();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => records.get(key) ?? null,
      setItem: (key: string, value: string) => records.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('preserves a higher score when an older tab saves settings', () => {
    const oldTab = readPreferences();
    savePreferences({ ...oldTab, best: 900 });
    savePreferences({ ...oldTab, best: 10, muted: true });
    expect(readPreferences()).toMatchObject({ best: 900, muted: true });
  });

  it('recovers from corrupt or invalid saved progress', () => {
    records.set('boughbound:v1', '{broken');
    expect(readPreferences()).toMatchObject({ best: 0, reduced: true });
    records.set('boughbound:v1', JSON.stringify({ version: 1, best: -100, muted: 'yes' }));
    expect(readPreferences()).toMatchObject({ best: 0, muted: false });
    records.set('boughbound:v1', JSON.stringify({ version: 99, best: 300 }));
    expect(readPreferences().best).toBe(0);
  });

  it('keeps playing possible when browser storage is denied', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Denied'); }, setItem: () => { throw new Error('Denied'); } });
    const defaults = readPreferences();
    expect(defaults.best).toBe(0);
    expect(() => savePreferences(defaults)).not.toThrow();
  });
});
