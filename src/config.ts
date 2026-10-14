export const GAME = {
  title: 'Boughbound', tagline: 'Every branch is a chance.',
  width: 480, viewHeight: 760, step: 1 / 60, duration: 90,
  ascentSpeed: 76, steerSpeed: 125, maxTips: 6, tipRadius: 5, pathInterval: 4,
} as const;
export const HEIGHT = GAME.duration * GAME.ascentSpeed;
