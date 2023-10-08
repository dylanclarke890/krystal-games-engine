import { SideOfCollision } from "../../../constants/enums.js";
import { COLLISION_ADJUSTMENT_BUFFER } from "../../../constants/global-constants.js";
import { Viewport } from "../../../graphics/viewport.js";
import { ViewportCollisionEvent } from "../../../types/common-types.js";
import { ScalarValue } from "../../../maths/scalar-value.js";
import { Vector2 } from "../../../maths/vector-2d.js";

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
  const finalVel = aVel.clone().mul(aMass.value).add(bVel.mul(bMass.value)).div(totalMass);

  bVel.set(finalVel);
  aVel.set(finalVel);
}

export function resolveViewportBounce(event: ViewportCollisionEvent, viewport: Viewport) {
  const { collider, rigidBody, side } = event;

  switch (side) {
    case SideOfCollision.Left:
      rigidBody.transform.position.x = collider.size.x / 2 + COLLISION_ADJUSTMENT_BUFFER;
      rigidBody.velocity.x *= -rigidBody.bounciness;
      break;
    case SideOfCollision.Right:
      rigidBody.transform.position.x = viewport.width - collider.size.x / 2 - COLLISION_ADJUSTMENT_BUFFER;
      rigidBody.velocity.x *= -rigidBody.bounciness;
      break;
    case SideOfCollision.Top:
      rigidBody.transform.position.y = collider.size.y / 2 + COLLISION_ADJUSTMENT_BUFFER;
      rigidBody.velocity.y *= -rigidBody.bounciness;
      break;
    case SideOfCollision.Bottom:
      rigidBody.transform.position.y = viewport.height - collider.size.y / 2 - COLLISION_ADJUSTMENT_BUFFER;
      rigidBody.velocity.y *= -rigidBody.bounciness;
      break;
    default:
      return;
  }
}
