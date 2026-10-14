const KEY = 'boughbound:v1';
export interface Preferences { version: 1; best: number; muted: boolean; reduced: boolean }
export function readPreferences(): Preferences {
  const defaults: Preferences = { version: 1, best: 0, muted: false, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data || typeof data !== 'object') return defaults;
    const p = data as Partial<Preferences>;
    if (p.version !== 1) return defaults;
    return { version: 1, best: typeof p.best === 'number' && Number.isFinite(p.best) && p.best >= 0 ? Math.floor(p.best) : 0,
      muted: typeof p.muted === 'boolean' ? p.muted : defaults.muted,
      reduced: typeof p.reduced === 'boolean' ? p.reduced : defaults.reduced };
  } catch { return defaults; }
}
export function savePreferences(p: Preferences): void {
  // A tab opened earlier must not overwrite a better score saved in another tab.
  try { localStorage.setItem(KEY, JSON.stringify({ ...p, best: Math.max(p.best, readPreferences().best) })); }
  catch { /* Local saving must never block play. */ }
}
