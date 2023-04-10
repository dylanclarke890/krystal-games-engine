export function safeParseInt(value: string): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? -1 : parsed;
}

export function constrain(num: number, min: number, max: number): number {
  return num < min ? min : num > max ? max : num;
}
