import { RectCollider, Rectangle, RigidBody, RenderableShape, Transform } from "../engine/components/index.js";
import { KrystalGameEngine } from "../engine/core/engine.js";
import { Vector2 } from "../engine/maths/vector2.js";
import { GameEvents } from "../engine/constants/enums.js";
import { isPointCollidingWithRect } from "../engine/physics/collision/index.js";

export class PointVsRectTest extends KrystalGameEngine {
  rectId!: number;

  constructor() {
    super("canvas1", 500, 500);

    this.context.input.enableMouse();
    this.context.events.on(GameEvents.LOOP_STARTED, () => this.update());

    this.#createRect();
    this.start();
  }

  #createRect() {
    const em = this.context.entities;
    const id = em.createEntity();
    const size = new Vector2(50, 200);

    const transform = new Transform();
    transform.position = new Vector2(200, 200);

    const rigidBody = new RigidBody(transform);
    rigidBody.addCollider(new RectCollider(size));

    this.rectId = id;
    em.addComponent(id, transform);
    em.addComponent(id, rigidBody);
    em.addComponent(id, new RenderableShape(transform, new Rectangle(size, "purple")));
  }

  update(): void {
    const rectRigidBody = this.context.entities.getComponent(this.rectId, "rigid-body");
    const rectCollider = rectRigidBody!.colliders[0];
    const rectShape = this.context.entities.getComponent(this.rectId, "renderable");

    if (isPointCollidingWithRect(this.context.input.mouse, rectRigidBody!.transform.position, rectCollider!.size)) {
      rectShape!.shape!.color = "green";
    } else {
      rectShape!.shape!.color = "purple";
    }
  }
}

new PointVsRectTest();
