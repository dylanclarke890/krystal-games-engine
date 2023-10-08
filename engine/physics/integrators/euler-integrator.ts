import { RigidBody } from "../../components/2d/rigid-body.js";
import { Vector2 } from "../../maths/vector2.js";
import { IIntegrator } from "../../types/common-interfaces.js";

export class EulerIntegrator implements IIntegrator {
  integrate(rigidBody: RigidBody, dt: number): void {
    const totalForce = new Vector2(0, 0);

    // Gravity
    if (rigidBody.gravity) {
      const gravitationalForce = rigidBody.gravity.clone().mulScalar(rigidBody.mass);
      totalForce.add(gravitationalForce);
    }

    // Friction (assuming μ is stored in rigidBody.friction as a scalar)
    if (rigidBody.velocity.magnitude() > 0 && typeof rigidBody.friction !== "undefined") {
      // Calculate the normal force (assuming we're on a horizontal plane)
      const normalForce = gravitationalForce.y; // only considering y-component for simplicity
      // Calculate frictional force magnitude
      const frictionMagnitude = rigidBody.friction * normalForce;
      // Get friction direction (opposite to velocity)
      const frictionDirection = rigidBody.velocity.clone().normalize().negate();
      // Apply frictional force
      totalForce.add(frictionDirection.mulScalar(frictionMagnitude));
    }

    // Apply acceleration
    rigidBody.applyForce(totalForce);

    // Update velocity
    rigidBody.velocity.add(rigidBody.acceleration.clone().mulScalar(dt));

    // Ensure velocity doesn't flip due to friction
    if (rigidBody.velocity.dot(rigidBody.acceleration) < 0) {
      rigidBody.velocity.set(0, 0);
    }

    // Update position
    rigidBody.transform.position.add(rigidBody.velocity.mulScalar(dt));

    // Reset external forces to zero after applying
    rigidBody.acceleration.set(0, 0);
  }
}
