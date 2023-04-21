export function perfectInelastic(
  vAiX: number,
  vAiY: number,
  vBiX: number,
  vBiY: number,
  mA: number,
  mB: number
): [number, number] {
  const totalMass = mA + mB;

  const vfX = (mA * vAiX + mB * vBiX) / totalMass;
  const vfY = (mA * vAiY + mB * vBiY) / totalMass;

  return [vfX, vfY];
}
