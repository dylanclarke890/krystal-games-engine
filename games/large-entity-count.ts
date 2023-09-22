import { Collision, GravityFactor, Position, Shape, Size, Velocity } from "../engine/components/index.js";
import { GameEvents } from "../engine/events/events.js";
import { Game } from "../engine/game.js";
import { CollisionSettings } from "../engine/utils/types.js";

export class LargeEntityCountTest extends Game {
  constructor() {
    super("canvas1", 500, 500);
    this.eventSystem.on(GameEvents.Loop_NextFrame, () => this.update());
    this.start();
  }

  update() {
    const em = this.entityManager;
    if (em.entities.size < 500) {
      const color = "yellow";

      const newEntity = em.createEntity();
      em.addComponent(newEntity, new Position(50, 100));
      em.addComponent(newEntity, new Shape("circle", color, { radius: 3 }));
      em.addComponent(newEntity, new Size(3, 3));
      em.addComponent(newEntity, new Velocity(5, 10));
      em.addComponent(newEntity, new GravityFactor());

      const collisionSettings: CollisionSettings = { viewportCollisionBehaviour: "BOUNCE" };
      em.addComponent(newEntity, new Collision("DEFAULT", collisionSettings));
    }

    const collisionDetector = this.systemManager.getSystem("PhysicSystem")!.detector;
    this.viewport.drawText(`${em.entities.size} objects`, 10, 20);
    this.viewport.drawText(`${collisionDetector.collisionChecks} entity collisions checked`, 10, 40);
    this.viewport.drawText(`${collisionDetector.entityCollisions.length} entity collisions found`, 10, 60);
    this.viewport.drawText(`${collisionDetector.viewportCollisions.size} viewport collisions found`, 10, 80);
  }
}

new LargeEntityCountTest();
