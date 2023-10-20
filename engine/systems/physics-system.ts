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
    return component.name === "rigid-body";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "rigid-body");
  }

  update(dt: number, entities: Set<number>) {
    const em = this.gameContext.entities;
    this.physicsContext.broadphase.clear();

    for (const id of entities) {
      const rigidBody = em.getComponent<RigidBody>(id, "rigid-body");

      if (typeof rigidBody === "undefined" || rigidBody.isStatic || rigidBody.isSleeping) {
        continue;
      }

      this.physicsContext.integrator.integrate(id, rigidBody, this.physicsContext.world.gravity, dt);

      rigidBody.collider.computeAABB();
      const entity = new ColliderEntity(id, rigidBody.collider);
      this.physicsContext.broadphase.add(entity);
    }

    this.physicsContext.broadphase.computePairs();
    const actualCollisions = this.physicsContext.detector.detect(this.physicsContext.broadphase.collisionPairs);
    this.physicsContext.resolver.resolve(actualCollisions);
  }
}
