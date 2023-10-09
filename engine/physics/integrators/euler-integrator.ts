import { RigidBody } from "../../components/2d/rigid-body.js";
import { Vector2 } from "../../maths/vector2.js";
import { BaseIntegrator } from "./base-integrator.js";

export class EulerIntegrator extends BaseIntegrator {
  integrate(rigidBody: RigidBody, dt: number): void {
    const totalForce = this.vectorPool.acquire(0, 0);
    this.pooledVectors.push(totalForce);

    // Gravity - Assume it's an acceleration, so multiply by mass to get force
    const gravitationalForce = this.vectorPool.acquire().assign(rigidBody.gravity).mulScalar(rigidBody.mass);
    totalForce.add(gravitationalForce);
    this.pooledVectors.push(gravitationalForce);

    // Friction (applied only if there's some velocity)
    if (rigidBody.velocity.magnitude() > 0) {
      const normalForceMagnitude = rigidBody.mass * rigidBody.gravity.y;
      const frictionMagnitude = rigidBody.friction * normalForceMagnitude;

      // The direction should be opposite to the velocity
      const frictionForce = this.vectorPool
        .acquire()
        .assign(rigidBody.velocity)
        .normalize()
        .mulScalar(-frictionMagnitude);

      totalForce.add(frictionForce);
      this.pooledVectors.push(frictionForce);
    }

    // Apply acceleration
    rigidBody.applyForce(totalForce);

    // Update velocity
    const acceleration = this.vectorPool.acquire().assign(rigidBody.acceleration).mulScalar(dt);
    rigidBody.velocity.add(acceleration);
    if (rigidBody.velocity.magnitude() <= this.epsilon) {
      rigidBody.velocity.assign(Vector2.zero);
    }
    this.pooledVectors.push(acceleration);

    // Update position
    const velocity = this.vectorPool.acquire().assign(rigidBody.velocity).mulScalar(dt);
    rigidBody.transform.position.add(velocity);
    this.pooledVectors.push(velocity);

    // Reset external forces to zero after applying
    rigidBody.acceleration.set(0, 0);

    this.releasePooledVectors();
  }
}
