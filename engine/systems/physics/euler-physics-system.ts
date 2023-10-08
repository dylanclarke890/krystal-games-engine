import { RigidBody } from "../../components/2d/rigid-body.js";
import { CollisionResponseType } from "../../constants/enums.js";
import { Collidable } from "../../types/common-types.js";
import { BasePhysicsSystem } from "./base-physics-system.js";

export class EulerPhysicsSystem extends BasePhysicsSystem {
  update(dt: number, entities: Set<number>) {
    const em = this.entityManager;
    const collidables: Collidable[] = [];
    this.quadtree.clear();

    for (const id of entities) {
      const rigidBody = em.getComponent<RigidBody>(id, "rigidBody");
      if (typeof rigidBody === "undefined" || rigidBody.isStatic) {
        continue;
      }

      // Friction
      if (typeof rigidBody.friction !== "undefined") {
        rigidBody.applyForce(rigidBody.friction.mul(dt));
      }

      // Gravity
      if (typeof rigidBody.gravity !== "undefined") {
        rigidBody.velocity.x += rigidBody.gravity.x * dt;
        rigidBody.velocity.y += rigidBody.gravity.y * dt;
      }

      // Acceleration
      const changeInVelocity = rigidBody.acceleration.clone();
      changeInVelocity.div(rigidBody.mass).mul(dt);
      rigidBody.velocity.add(changeInVelocity);

      // Reset acceleration each frame after it's been applied
      rigidBody.acceleration.set(0, 0);

      // Position
      rigidBody.transform.position.x += rigidBody.velocity.x * dt;
      rigidBody.transform.position.y += rigidBody.velocity.y * dt;

      // Update colliders
      for (const collider of rigidBody.colliders) {
        if (collider.responseType === CollisionResponseType.None) {
          continue;
        }

        collidables.push([id, rigidBody, collider]);
        this.quadtree.insert(id, rigidBody, collider);
      }
    }

    // Detect/resolve collisions
    this.detector.detect(collidables);
    this.resolver.resolve(this.detector);
  }
}
