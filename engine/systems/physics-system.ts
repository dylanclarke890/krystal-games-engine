import { BaseSystem } from "./base-system.js";
import { BaseComponent, RigidBody } from "../components/index.js";
import { GameContext } from "../core/context.js";
import { SystemType } from "../types/common-types.js";
import { PhysicsContext } from "../physics/context.js";
import { ColliderEntity } from "../physics/collision/data.js";

export class PhysicsSystem extends BaseSystem {
  priority: number = 5;
  name: SystemType = "physics";
  physicsContext: PhysicsContext;

  constructor(gameContext: GameContext, physicsContext: PhysicsContext) {
    super(gameContext);
    this.physicsContext = physicsContext;
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigid-body" || component.type === "collider";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponents(entity, ["rigid-body", "collider"]);
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
        this.physicsContext.broadphase.add(entity);
        continue;
      }

      if (rigidBody.isStatic) {
        continue;
      }

      rigidBodies.push(rigidBody);
      rigidBody.applyForce(this.physicsContext.world.gravity.clone().mulScalar(rigidBody.mass));
      this.physicsContext.integrator.integrate(id, rigidBody, dt);

      for (const collider of rigidBody.colliders) {
        const entity = new ColliderEntity(id, collider);
        this.physicsContext.broadphase.add(entity);
      }
    }

    const possibleCollisions = this.physicsContext.broadphase.computePairs();
    const actualCollisions = this.physicsContext.detector.detect(possibleCollisions);
    this.physicsContext.resolver.resolve(actualCollisions);

    for (const body of rigidBodies) {
      body.force.set(0, 0);
    }
  }
}
