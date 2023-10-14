export function safeParseInt(value: string): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? -1 : parsed;
}

export function clamp(num: number, min: number, max: number): number {
  return num < min ? min : num > max ? max : num;
}

export function randomInt(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
