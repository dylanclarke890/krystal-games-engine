import { BaseSystem } from "./base-system.js";
import { BaseComponent, RigidBody } from "../components/index.js";
import { GameContext } from "../core/context.js";
import { PhysicsContext } from "../physics/context.js";
import { ColliderEntity } from "../physics/collision/data.js";
import { SystemGroup } from "../types/common-types.js";

export class PhysicsSystem extends BaseSystem {
  name: string = "krystal__physics-system";
  group: SystemGroup = "physics";
  physicsContext: PhysicsContext;

  constructor(gameContext: GameContext, physicsContext: PhysicsContext) {
    super(gameContext);
    this.physicsContext = physicsContext;
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigid-body" || component.type === "collider";
  }

  belongsToSystem(entity: number): boolean {
    const em = this.gameContext.entities;
    return em.hasComponent(entity, "rigid-body") || em.hasComponent(entity, "collider");
  }

  update(dt: number, entities: Set<number>) {
    const em = this.gameContext.entities;
    this.physicsContext.broadphase.clear();

    const rigidBodies: RigidBody[] = [];
    for (const id of entities) {
      const rigidBody = em.getComponent(id, "rigid-body");

      if (typeof rigidBody === "undefined") {
        const collider = em.getComponent(id, "collider");
        if (typeof collider === "undefined") {
          continue;
        }

        const entity = new ColliderEntity(id, collider);
        collider.computeAABB();
        this.physicsContext.broadphase.add(entity);
        continue;
      }

      if (rigidBody.isStatic) {
        continue;
      }

      rigidBodies.push(rigidBody);

      this.physicsContext.integrator.integrate(id, rigidBody, this.physicsContext.world.gravity, dt);

      for (const collider of rigidBody.colliders) {
        collider.computeAABB();
        const entity = new ColliderEntity(id, collider);
        this.physicsContext.broadphase.add(entity);
      }
    }

    this.physicsContext.broadphase.computePairs();
    const actualCollisions = this.physicsContext.detector.detect(this.physicsContext.broadphase.collisionPairs);
    this.physicsContext.resolver.resolve(actualCollisions);

    for (const body of rigidBodies) {
      body.force.set(0, 0);
    }
  }
}
