import { RigidBody } from "../../components/2d/rigid-body.js";
import { Vector2 } from "../../maths/vector2.js";
import { BaseIntegrator } from "./base-integrator.js";

/** 
 * Semi-implicit Euler.
 * @see https://en.wikipedia.org/wiki/Semi-implicit_Euler_method */
export class SemiImplicitEulerIntegrator extends BaseIntegrator {
  integrate(rigidBody: RigidBody, dt: number): void {
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
}
