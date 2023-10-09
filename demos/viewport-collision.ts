import { Circle, CircleCollider, RenderableShape, RigidBody, Transform } from "../engine/components/index.js";
import { GameEvents } from "../engine/constants/enums.js";
import { KrystalGameEngine } from "../engine/core/engine.js";
import { Vector2 } from "../engine/maths/vector2.js";

export class ViewportCollisionTest extends KrystalGameEngine {
  testEntityId!: number;

  constructor() {
    super("canvas1", 500, 500);
    this.context.events.on(GameEvents.LOOP_STARTED, this.update.bind(this));
    this.createTestEntity();
    this.start();
  }

  createTestEntity() {
    const em = this.context.entities;
    const newEntity = em.createEntity();
    this.testEntityId = newEntity;

    const transform = new Transform();
    transform.position = new Vector2(50, 100);

    const rigidBody = new RigidBody(transform);
    rigidBody.velocity = new Vector2(5, 10);
    rigidBody.colliders.push(new CircleCollider(3));

    em.addComponent(newEntity, transform);
    em.addComponent(newEntity, rigidBody);
    em.addComponent(newEntity, new RenderableShape(transform, new Circle(3, "yellow")));
  }

  update() {
    const rigidBody = this.context.entities.getComponent<RigidBody>(this.testEntityId, "rigidBody")!;
    const pos = rigidBody.transform.position;
    const vel = rigidBody.velocity;

    this.context.viewport.drawText(`position - x: ${pos.x}, y: ${pos.y}`, 10, 20);
    this.context.viewport.drawText(`velocity - x: ${vel.x}, y: ${vel.y}`, 10, 40);
  }
}

new ViewportCollisionTest();
