import { Vector2 } from "../../../maths/vector2.js";
import { CollisionInfo } from "../data.js";

export class ResolutionStrategies {
  static resolveWithImpulses(info: CollisionInfo): void {
    const a = info.entityA;
    const b = info.entityB;
    const aRigidBody = a.collider.rigidBody;
    const bRigidBody = b.collider.rigidBody;

    if (typeof aRigidBody === "undefined" || typeof bRigidBody === "undefined") {
      return;
    }

    const totalInverseMass = 1 / aRigidBody.mass + 1 / bRigidBody.mass;
    const restitution = Math.min(a.collider.material.restitution, b.collider.material.restitution);
    const relativeVelocity = aRigidBody.velocity.clone().sub(bRigidBody.velocity);

    const impulseMagnitude = (-(1 + restitution) * relativeVelocity.dot(info.normal)) / totalInverseMass;
    const impulseDirection = info.normal.clone();
    const impulse = impulseDirection.mulScalar(impulseMagnitude);

    // Apply impulse to each entity's velocity based on its mass
    aRigidBody.velocity.add(impulse.clone().divScalar(aRigidBody.mass));
    bRigidBody.velocity.sub(impulse.clone().divScalar(bRigidBody.mass));
  }

  static resolveCircles(info: CollisionInfo): void {
    const a = info.entityA;
    const b = info.entityB;

    const aRigidBody = a.collider.rigidBody;
    const bRigidBody = b.collider.rigidBody;
    if (typeof aRigidBody === "undefined" || typeof bRigidBody === "undefined") {
      return;
    }

    const aMass = aRigidBody.mass;
    const bMass = bRigidBody.mass;
    const totalMass = aMass + bMass;

    const aBounciness = a.collider.material.restitution;
    const bBounciness = b.collider.material.restitution;
    const restitution = Math.min(aBounciness, bBounciness);

    const aFriction = a.collider.material.friction;
    const bFriction = b.collider.material.friction;
    const friction = Math.sqrt(aFriction * bFriction);

    const totalOverlap = info.normal.clone().mulScalar(info.penetration);
    const overlapA = totalOverlap.clone().mulScalar(bMass / totalMass);
    const overlapB = totalOverlap.clone().mulScalar(aMass / totalMass);

    // Current
    const aPosition = a.collider.getAbsolutePosition();
    aPosition.sub(overlapA);
    a.collider.setAbsolutePosition(aPosition);

    // Target
    const bPosition = b.collider.getAbsolutePosition();
    bPosition.add(overlapB);
    b.collider.setAbsolutePosition(bPosition);

    const tangent = new Vector2(-info.normal.y, info.normal.x);
    const aVelocity = aRigidBody.velocity;
    const bVelocity = bRigidBody.velocity;

    // Dot Product Tangent
    const aDotTan = aVelocity.dot(tangent) * friction;
    const bDotTan = bVelocity.dot(tangent) * friction;

    // Dot Product Normal
    const aDotNormal = aVelocity.dot(info.normal);
    const bDotNormal = bVelocity.dot(info.normal);

    // Compute new normal velocities using restitution
    const aMomentum =
      (restitution * bMass * (bDotNormal - aDotNormal) + aMass * aDotNormal + bMass * bDotNormal) / totalMass;
    const bMomentum =
      (restitution * aMass * (aDotNormal - bDotNormal) + aMass * aDotNormal + bMass * bDotNormal) / totalMass;

    // Update ball velocities
    aVelocity.x = tangent.x * aDotTan + info.normal.x * aMomentum;
    aVelocity.y = tangent.y * aDotTan + info.normal.y * aMomentum;
    bVelocity.x = tangent.x * bDotTan + info.normal.x * bMomentum;
    bVelocity.y = tangent.y * bDotTan + info.normal.y * bMomentum;
  }
}
