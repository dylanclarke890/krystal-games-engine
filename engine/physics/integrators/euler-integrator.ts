import { RigidBody } from "../../components/rigid-body.js";
import { SideOfCollision } from "../../constants/enums.js";
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
    if (rigidBody.velocity.magnitude() <= this.velocityEpsilon) {
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
    const { collider, rigidBody, sides } = event;
    const viewport = this.context.viewport;

    if (sides.has(SideOfCollision.LEFT)) {
      rigidBody.transform.position.x = collider.size.x / 2 + this.adjustmentBuffer;
      rigidBody.velocity.x *= -rigidBody.bounciness;
    }

    if (sides.has(SideOfCollision.RIGHT)) {
      rigidBody.transform.position.x = viewport.width - collider.size.x / 2 - this.adjustmentBuffer;
      rigidBody.velocity.x *= -rigidBody.bounciness;
    }

    if (sides.has(SideOfCollision.TOP)) {
      rigidBody.transform.position.y = collider.size.y / 2 + this.adjustmentBuffer;
      rigidBody.velocity.y *= -rigidBody.bounciness;
    }

    if (sides.has(SideOfCollision.BOTTOM)) {
      rigidBody.transform.position.y = viewport.height - collider.size.y / 2 - this.adjustmentBuffer;
      rigidBody.velocity.y *= -rigidBody.bounciness;
    }
  }
}
