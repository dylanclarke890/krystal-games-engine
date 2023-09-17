export function elastic(vAi: number, vBi: number, mA: number, mB: number): Pair<number> {
  if (mA === mB) {
    return [vBi, vAi]; // Can just swap velocities if masses are equal
  }

  // Calculate new velocities using conservation of momentum equation:
  const totalMass = mA + mB;
  const vAf = ((mA - mB) * vAi + 2 * mB * vBi) / totalMass;
  const vBf = (2 * mA * vAi + (mB - mA) * vBi) / totalMass;

  return [vAf, vBf];
}

export function perfectlyInelastic(vAi: number, vBi: number, mA: number, mB: number): Pair<number> {
  const fA = mA * vAi;
  const fB = mB * vBi;
  const totalMass = mA + mB;

  const newVel = (fA + fB) / totalMass;

  return [newVel, newVel];
}
