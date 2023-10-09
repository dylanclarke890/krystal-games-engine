import { Circle, CircleCollider, RenderableShape, RigidBody, Transform } from "../engine/components/index.js";
import { GameEvents } from "../engine/constants/enums.js";
import { KrystalGameEngine } from "../engine/engine.js";
import { bounceOffViewportBoundaries } from "../engine/physics/collision/index.js";
import { PhysicsSystem } from "../engine/systems/physics-system.js";
import { ViewportCollisionEvent } from "../engine/types/common-types.js";
import { Vector2 } from "../engine/maths/vector2.js";

export class LargeEntityCountTest extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);
    this.eventManager.on(GameEvents.LOOP_STARTED, this.update.bind(this));
    this.eventManager.on(GameEvents.VIEWPORT_COLLISION, (event: ViewportCollisionEvent) => {
      bounceOffViewportBoundaries(event, this.viewport);
    });
    this.start();
  }

  update() {
    const em = this.entityManager;
    if (em.entities.size < 500) {
      const newEntity = em.createEntity();

      const transform = new Transform();
      transform.position = new Vector2(50, 100);

      const rigidBody = new RigidBody(transform);
      rigidBody.velocity = new Vector2(10, 0);
      rigidBody.colliders.push(new CircleCollider(3));

      em.addComponent(newEntity, transform);
      em.addComponent(newEntity, rigidBody);
      em.addComponent(newEntity, new RenderableShape(transform, new Circle(3, "yellow")));
    }

    const collisionDetector = this.systemManager.getSystem<PhysicsSystem>("PhysicsSystem")!.detector;
    this.viewport.drawText(`${em.entities.size} objects`, 10, 20);
    this.viewport.drawText(`${collisionDetector.collisionChecks} entity collisions checked`, 10, 40);
    this.viewport.drawText(`${collisionDetector.entityCollisions.size} entity collisions found`, 10, 60);
    this.viewport.drawText(`${collisionDetector.viewportCollisions.size} viewport collisions found`, 10, 80);
  }
}

new LargeEntityCountTest();
