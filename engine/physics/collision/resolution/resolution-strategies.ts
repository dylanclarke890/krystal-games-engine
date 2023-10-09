import { ScalarValue } from "../../../maths/scalar-value.js";
import { Vector2 } from "../../../maths/vector2.js";

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

export function inelastic2D(aVel: Vector2, bVel: Vector2, aMass: ScalarValue, bMass: ScalarValue): void {
  const totalMass = aMass.value + bMass.value;
  const finalVel = aVel.clone().mulScalar(aMass.value).add(bVel.mulScalar(bMass.value)).divScalar(totalMass);

  bVel.assign(finalVel);
  aVel.assign(finalVel);
}
