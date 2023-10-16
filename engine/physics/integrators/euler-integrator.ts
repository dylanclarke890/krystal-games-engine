import { RigidBody } from "../../components/rigid-body.js";
import { Vector2 } from "../../maths/vector2.js";
import { BaseIntegrator } from "./base-integrator.js";

/**
 * Semi-implicit Euler.
 * @see https://en.wikipedia.org/wiki/Semi-implicit_Euler_method */
export class SemiImplicitEulerIntegrator extends BaseIntegrator {
  integrate(_entityId: number, rigidBody: RigidBody, gravity: Vector2, dt: number): void {
    // Apply forces - gravity, drag
    rigidBody.applyForce(gravity.clone().mulScalar(rigidBody.mass));
    rigidBody.applyForce(rigidBody.velocity.clone().negate().mulScalar(rigidBody.damping));

    // Update velocity
    const acceleration = this.vectorPool.acquire().assign(rigidBody.force).mulScalar(dt);
    rigidBody.velocity.add(acceleration);
    if (rigidBody.velocity.magnitude() <= this.velocityEpsilon) {
      rigidBody.velocity.assign(Vector2.zero);
    }

    // Update position
    const velocity = this.vectorPool.acquire().assign(rigidBody.velocity).mulScalar(dt);
    rigidBody.transform.position.add(velocity);

    this.vectorPool.release(acceleration);
    this.vectorPool.release(velocity);
  }
}
