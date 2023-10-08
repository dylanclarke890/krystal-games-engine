import { RigidBody } from "../../components/2d/rigid-body.js";
import { IIntegrator } from "../../types/common-interfaces.js";
import { Vector2D } from "../../utils/maths/vector-2d.js";

export class EulerIntegrator implements IIntegrator {
  integrate(rigidBody: RigidBody, dt: number): void {
    // Calculate total force acting on the body
    const totalForce = new Vector2D(0, 0);

    // Friction (assuming it's a force opposing the velocity)
    if (typeof rigidBody.friction !== "undefined") {
      rigidBody.applyForce(rigidBody.friction.negate()); // Assuming friction is opposing the motion
    }

    // Gravity (assuming it's an acceleration, so multiply by mass to get force)
    if (typeof rigidBody.gravity !== "undefined") {
      totalForce.add(rigidBody.gravity.mul(rigidBody.mass));
    }

    // Other external forces can be added here...
    totalForce.add(rigidBody.externalForces); // if you have other external forces

    // Compute acceleration (F = ma => a = F/m)
    let acceleration = totalForce.div(rigidBody.mass);

    // Update velocity
    rigidBody.velocity.add(acceleration.mul(dt));

    // Update position
    rigidBody.transform.position.add(rigidBody.velocity.mul(dt));

    // Reset external forces to zero after applying
    rigidBody.externalForces.set(0, 0);
  }
}
