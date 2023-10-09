import { RigidBody } from "../../components/rigid-body.js";
import { SideOfCollision } from "../../constants/enums.js";
import { COLLISION_ADJUSTMENT_BUFFER } from "../../constants/global-constants.js";
import { Vector2 } from "../../maths/vector2.js";
import { ViewportCollisionEvent } from "../../types/common-types.js";
import { BaseIntegrator } from "./base-integrator.js";

/**
 * Semi-implicit Euler.
 * @see https://en.wikipedia.org/wiki/Semi-implicit_Euler_method */
export class SemiImplicitEulerIntegrator extends BaseIntegrator {
  integrate(_entityId: number, rigidBody: RigidBody, dt: number): void {
    // Update velocity
    const acceleration = this.vectorPool.acquire().assign(rigidBody.force).mulScalar(dt);
    rigidBody.velocity.add(acceleration);
    if (rigidBody.velocity.magnitude() <= this.epsilon) {
      rigidBody.velocity.assign(Vector2.zero);
    }
    this.pooledVectors.push(acceleration);

    // Update position
    const velocity = this.vectorPool.acquire().assign(rigidBody.velocity).mulScalar(dt);
    rigidBody.transform.position.add(velocity);
    this.pooledVectors.push(velocity);

    this.releasePooledVectors();
  }

  bounceOffViewportBoundaries(event: ViewportCollisionEvent) {
    const { collider, rigidBody, side } = event;

    switch (side) {
      case SideOfCollision.Left:
        rigidBody.transform.position.x = collider.size.x / 2 + COLLISION_ADJUSTMENT_BUFFER;
        rigidBody.velocity.x *= -rigidBody.bounciness;
        break;
      case SideOfCollision.Right:
        rigidBody.transform.position.x = this.viewport.width - collider.size.x / 2 - COLLISION_ADJUSTMENT_BUFFER;
        rigidBody.velocity.x *= -rigidBody.bounciness;
        break;
      case SideOfCollision.Top:
        rigidBody.transform.position.y = collider.size.y / 2 + COLLISION_ADJUSTMENT_BUFFER;
        rigidBody.velocity.y *= -rigidBody.bounciness;
        break;
      case SideOfCollision.Bottom:
        rigidBody.transform.position.y = this.viewport.height - collider.size.y / 2 - COLLISION_ADJUSTMENT_BUFFER;
        rigidBody.velocity.y *= -rigidBody.bounciness;
        break;
      default:
        return;
    }
  }
}
