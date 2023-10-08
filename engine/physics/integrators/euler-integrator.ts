import { RigidBody } from "../../components/2d/rigid-body.js";
import { IIntegrator } from "../../types/common-interfaces.js";

export class EulerIntegrator implements IIntegrator {
  integrate(rigidBody: RigidBody, dt: number): void {
    // Apply friction
    if (typeof rigidBody.friction !== "undefined") {
      rigidBody.applyForce(rigidBody.friction.mul(dt));
    }

    // Apply gravity
    if (typeof rigidBody.gravity !== "undefined") {
      rigidBody.velocity.x += rigidBody.gravity.x * dt;
      rigidBody.velocity.y += rigidBody.gravity.y * dt;
    }

    // Apply acceleration (e.g., from external forces)
    const changeInVelocity = rigidBody.acceleration.clone();
    changeInVelocity.div(rigidBody.mass).mul(dt);
    rigidBody.velocity.add(changeInVelocity);

    // Update position based on the new velocity
    rigidBody.transform.position.x += rigidBody.velocity.x * dt;
    rigidBody.transform.position.y += rigidBody.velocity.y * dt;

    // Reset acceleration after applying
    rigidBody.acceleration.set(0, 0);
  }
}
