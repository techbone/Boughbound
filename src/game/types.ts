export interface Point { x: number; y: number }
export interface Branch {
  id: number; parent: number | null; depth: number; path: Point[];
  status: 'growing' | 'forked' | 'withered' | 'bloomed';
}
export interface Tip extends Point { id: number; branchId: number; vx: number; impulse: number }
export interface Entity extends Point {
  id: number; kind: 'light' | 'fork' | 'thorn'; radius: number; consumed: boolean;
}
export interface Corridor extends Point { halfWidth: number }
export interface RunState {
  seed: number; tick: number; elapsed: number; height: number; phase: 'playing' | 'lost' | 'won';
  tips: Tip[]; branches: Branch[]; entities: Entity[]; corridors: Corridor[];
  score: number; light: number; forks: number; lost: number; peakTips: number; nextTipId: number;
}
export interface GameEvent extends Point { kind: 'light' | 'fork' | 'prune' | 'win' | 'lose'; value: number }
