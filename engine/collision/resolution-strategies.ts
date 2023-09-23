import { ScalarValue } from "../utils/maths/scalar-value.js";
import { Vector2D } from "../utils/maths/vector-2d.js";

type Result = Pair<number>;

export function elastic1D(aVel: ScalarValue, bVel: ScalarValue, aMass: ScalarValue, bMass: ScalarValue): Result {
  if (aMass.value === bMass.value) {
    return [bVel.value, aVel.value]; // Can just swap velocities if masses are equal
  }

  // Calculate new velocities using conservation of momentum equation:
  const totalMass = aMass.value + bMass.value;
  const vAf = ((aMass.value - bMass.value) * aVel.value + 2 * bMass.value * bVel.value) / totalMass;
  const vBf = (2 * aMass.value * aVel.value + (bMass.value - aMass.value) * bVel.value) / totalMass;

  return [vAf, vBf];
}

export function inelastic1D(aVel: ScalarValue, bVel: ScalarValue, aMass: ScalarValue, bMass: ScalarValue): Result {
  const totalMass = aMass.value + bMass.value;

  const aForce = aMass.value * aVel.value;
  const bForce = bMass.value * bVel.value;
  const resultingVelocity = (aForce + bForce) / totalMass;

  return [resultingVelocity, resultingVelocity];
}

export function inelastic2D(aVel: Vector2D, bVel: Vector2D, aMass: ScalarValue, bMass: ScalarValue): Result {
  const totalMass = aMass.value + bMass.value;

  const vfX = (aMass.value * aVel.x + bMass.value * bVel.x) / totalMass;
  const vfY = (aMass.value * aVel.y + bMass.value * bVel.y) / totalMass;

  return [vfX, vfY];
}
