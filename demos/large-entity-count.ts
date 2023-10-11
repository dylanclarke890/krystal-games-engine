import { Circle, CircleCollider, RenderableShape, RigidBody, Transform } from "../engine/components/index.js";
import { PhysicsMaterial } from "../engine/components/physics-material.js";
import { GameEvents } from "../engine/constants/enums.js";
import { KrystalGameEngine } from "../engine/core/engine.js";
import { Vector2 } from "../engine/maths/vector2.js";

export class LargeEntityCountTest extends KrystalGameEngine {
  static MAX_ENTITIES = 500;
  constructor() {
    super("canvas1", 500, 500);
    this.context.events.on(GameEvents.LOOP_STARTED, this.update.bind(this));
    this.start();
  }

  update() {
    const em = this.context.entities;
    if (em.entities.size < LargeEntityCountTest.MAX_ENTITIES) {
      const newEntity = em.createEntity();

      const transform = new Transform();
      transform.position = new Vector2(50, 100);

      const rigidBody = new RigidBody(transform);
      rigidBody.velocity = new Vector2(10, 0);
      rigidBody.colliders.push(new CircleCollider(new PhysicsMaterial(), 3));

      em.addComponent(newEntity, transform);
      em.addComponent(newEntity, rigidBody);
      em.addComponent(newEntity, new RenderableShape(transform, new Circle(3, "yellow")));
    }

    const collisionDetector = this.context.systems.getSystem("physics")!.detector;
    const viewport = this.context.viewport;
    viewport.drawText(`${em.entities.size} objects`, 10, 20);
    viewport.drawText(`${collisionDetector.collisionChecksThisFrame} entity collisions checked`, 10, 40);
    viewport.drawText(`${collisionDetector.entityCollisions.size} entity collisions found`, 10, 60);
    viewport.drawText(`${collisionDetector.viewportCollisions.size} viewport collisions found`, 10, 80);
  }
}

new LargeEntityCountTest();
