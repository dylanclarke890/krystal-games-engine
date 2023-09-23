export function calcHypotenuse(x: number, y: number, z?: number): number {
  z ??= 0;
  return Math.sqrt(x * x + y * y + z * z);
}