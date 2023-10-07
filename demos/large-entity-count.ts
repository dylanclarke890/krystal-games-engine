import { Circle, CircleCollider, RenderableShape, RigidBody } from "../engine/components/2d/index.js";
import { GameEvents } from "../engine/constants/enums.js";
import { KrystalGameEngine } from "../engine/engine.js";
import { PhysicsSystem } from "../engine/systems/physics-system.js";
import { Vector2D } from "../engine/utils/maths/vector-2d.js";

export class LargeEntityCountTest extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);
    this.eventManager.on(GameEvents.LOOP_STARTED, this.update.bind(this));
    this.start();
  }

  update() {
    const em = this.entityManager;
    if (em.entities.size < 500) {
      const newEntity = em.createEntity();
      const position = new Vector2D(50, 100);
      const renderable = new RenderableShape(position, new Circle(3, "yellow"));

      const rigidBody = new RigidBody(position);
      rigidBody.velocity = new Vector2D(5, 10);
      rigidBody.gravity = new Vector2D(0, 9.81);
      rigidBody.colliders.push(new CircleCollider(3));

      em.addComponent(newEntity, rigidBody);
      em.addComponent(newEntity, renderable);
    }

    const collisionDetector = this.systemManager.getSystem<PhysicsSystem>("PhysicsSystem")!.detector;
    this.viewport.drawText(`${em.entities.size} objects`, 10, 20);
    this.viewport.drawText(`${collisionDetector.collisionChecks} entity collisions checked`, 10, 40);
    this.viewport.drawText(`${collisionDetector.entityCollisions.size} entity collisions found`, 10, 60);
    this.viewport.drawText(`${collisionDetector.viewportCollisions.size} viewport collisions found`, 10, 80);
  }
}

new LargeEntityCountTest();
