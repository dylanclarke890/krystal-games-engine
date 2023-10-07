import { CollisionDetector, CollisionResolver } from "../physics/collision/index.js";
import { IEntityManager, IEventManager, IQuadtree } from "../types/common-interfaces.js";
import { Assert } from "../utils/assert.js";
import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { RigidBody } from "../components/2d/rigid-body.js";
import { CollisionResponseType } from "../constants/enums.js";
import { Collidable } from "../types/common-types.js";

export class PhysicsSystem extends BaseSystem {
  priority: number = 5;
  name: string = "PhysicsSystem";
  requiredComponents: string[] = ["rigidBody"];

  quadtree: IQuadtree;
  detector: CollisionDetector;
  resolver: CollisionResolver;

  constructor(
    entityManager: IEntityManager,
    eventManager: IEventManager,
    quadtree: IQuadtree,
    detector: CollisionDetector,
    resolver: CollisionResolver
  ) {
    super(entityManager, eventManager);
    Assert.instanceOf("detector", detector, CollisionDetector);
    Assert.instanceOf("resolver", resolver, CollisionResolver);

    this.quadtree = quadtree;
    this.detector = detector;
    this.resolver = resolver;
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigidBody";
  }

  belongsToSystem(entity: number): boolean {
    return this.entityManager.hasComponent(entity, "rigidBody");
  }

  update(dt: number, entities: Set<number>) {
    const em = this.entityManager;
    const collidables: Collidable[] = [];
    this.quadtree.clear();

    for (const id of entities) {
      const rigidBody = em.getComponent<RigidBody>(id, "rigidBody");
      if (typeof rigidBody === "undefined" || rigidBody.isStatic) {
        continue;
      }

      // Apply acceleration
      const changeInVelocity = rigidBody.acceleration.clone();
      changeInVelocity.div(rigidBody.mass).mul(dt);
      rigidBody.velocity.add(changeInVelocity);

      // Apply friction
      if (typeof rigidBody.friction !== "undefined") {
        const frictionDrag = rigidBody.mass * dt;
        rigidBody.velocity.x -= frictionDrag;
        rigidBody.velocity.y -= frictionDrag;
      }

      if (typeof rigidBody.gravity !== "undefined") {
        rigidBody.velocity.x = rigidBody.gravity.x * dt;
        rigidBody.velocity.y = rigidBody.gravity.y * dt;
      }

      rigidBody.position.x += rigidBody.velocity.x * dt;
      rigidBody.position.y += rigidBody.velocity.y * dt;

      for (const collider of rigidBody.colliders) {
        if (collider.responseType === CollisionResponseType.None) {
          continue;
        }

        collidables.push([id, rigidBody, collider]);
        this.quadtree.insert(id, rigidBody, collider);
      }
    }

    this.detector.detect(collidables);
    this.resolver.resolve(this.detector);
  }
}
