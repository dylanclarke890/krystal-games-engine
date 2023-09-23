import { ScalarValue } from "../utils/maths/scalar-value.js";
import { Vector2D } from "../utils/maths/vector-2d.js";

export function elastic1D(aVel: ScalarValue, bVel: ScalarValue, aMass: ScalarValue, bMass: ScalarValue): void {
  if (aMass.value === bMass.value) {
    // Can just swap velocities if masses are equal
    const tmp = aVel.value;
    aVel.set(bVel.value);
    bVel.set(tmp);
    return;
  }

  // Calculate new velocities using conservation of momentum equation:
  const totalMass = aMass.value + bMass.value;
  const aFinalVel = ((aMass.value - bMass.value) * aVel.value + 2 * bMass.value * bVel.value) / totalMass;
  const bFinalVel = (2 * aMass.value * aVel.value + (bMass.value - aMass.value) * bVel.value) / totalMass;

  aVel.set(aFinalVel);
  bVel.set(bFinalVel);
}

export function inelastic1D(aVel: ScalarValue, bVel: ScalarValue, aMass: ScalarValue, bMass: ScalarValue): void {
  const totalMass = aMass.value + bMass.value;

  const aForce = aMass.value * aVel.value;
  const bForce = bMass.value * bVel.value;
  const resultingVelocity = (aForce + bForce) / totalMass;

  aVel.set(resultingVelocity);
  bVel.set(resultingVelocity);
}

export function inelastic2D(aVel: Vector2D, bVel: Vector2D, aMass: ScalarValue, bMass: ScalarValue): void {
  const totalMass = aMass.value + bMass.value;
  const finalVel = aVel.clone().mul(aMass.value).add(bVel.mul(bMass.value)).div(totalMass);

  bVel.set(finalVel);
  aVel.set(finalVel);
}
