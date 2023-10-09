import { CollisionDetector, CollisionResolver } from "../physics/collision/index.js";
import { IEntityManager, IEventManager, IQuadtree } from "../types/common-interfaces.js";
import { Assert } from "../utils/assert.js";
import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/base.js";
import { Collidable } from "../types/common-types.js";
import { RigidBody } from "../components/rigid-body.js";
import { CollisionResponseType } from "../constants/enums.js";
import { BaseIntegrator } from "../physics/integrators/base-integrator.js";
import { World } from "../physics/world.js";

export class PhysicsSystem extends BaseSystem {
  priority: number = 5;
  name: string = "PhysicsSystem";
  requiredComponents: string[] = ["rigidBody"];

  quadtree: IQuadtree;
  detector: CollisionDetector;
  resolver: CollisionResolver;
  integrator: BaseIntegrator;
  world: World;

  constructor(
    entityManager: IEntityManager,
    eventManager: IEventManager,
    quadtree: IQuadtree,
    detector: CollisionDetector,
    resolver: CollisionResolver,
    integrator: BaseIntegrator,
    world: World
  ) {
    super(entityManager, eventManager);
    Assert.instanceOf("detector", detector, CollisionDetector);
    Assert.instanceOf("resolver", resolver, CollisionResolver);

    this.quadtree = quadtree;
    this.detector = detector;
    this.resolver = resolver;
    this.integrator = integrator;
    this.world = world;
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

      rigidBody.applyForce(this.world.gravity.clone().mulScalar(rigidBody.mass));

      this.integrator.integrate(id, rigidBody, dt);

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

    // Reset forces back to zero
    for (const id of entities) {
      const rigidBody = em.getComponent<RigidBody>(id, "rigidBody");
      if (typeof rigidBody === "undefined" || rigidBody.isStatic) {
        continue;
      }
      rigidBody.force.set(0, 0);
    }
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigidBody";
  }

  belongsToSystem(entity: number): boolean {
    return this.entityManager.hasComponent(entity, "rigidBody");
  }
}
