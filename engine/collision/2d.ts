export function getNewVelocitiesForPerfectlyInelastic(
  vAi: number,
  vBi: number,
  mA: number,
  mB: number
): [number, number] {
  const fA = mA * vAi;
  const fB = mB * vBi;
  const totalMass = mA + mB;

  const newVel = (fA + fB) / totalMass;

  return [newVel, newVel];
}
