import { GameEvents } from "../engine/constants/enums.js";
import { areRectsColliding } from "../engine/physics/collision/detection/detection-strategies.js";
import { RectCollider, Rectangle, RigidBody, RenderableShape, Transform } from "../engine/components/index.js";
import { KrystalGameEngine } from "../engine/core/engine.js";
import { Vector2 } from "../engine/maths/vector2.js";

export class RectVsRectTest extends KrystalGameEngine {
  mouseRectId: number;
  staticRectId: number;
  constructor() {
    super("canvas1", 500, 500);
    this.eventManager.on(GameEvents.LOOP_STARTED, () => this.update());
    this.inputManager.enableMouse();

    this.staticRectId = this.#createRect(new Vector2(250, 150), new Vector2(50, 200), "purple");
    this.mouseRectId = this.#createRect(new Vector2(), new Vector2(50, 150), "orange");

    this.start();
  }

  #createRect(position: Vector2, size: Vector2, color: string): number {
    const id = this.entityManager.createEntity();

    const transform = new Transform();
    transform.position = position;

    const rigidBody = new RigidBody(transform);
    rigidBody.addCollider(new RectCollider(size));

    const renderable = new RenderableShape(transform, new Rectangle(size, color));

    this.entityManager.addComponent(id, transform);
    this.entityManager.addComponent(id, rigidBody);
    this.entityManager.addComponent(id, renderable);

    return id;
  }

  update() {
    const mouseRigidBody = this.entityManager.getComponent<RigidBody>(this.mouseRectId, "rigidBody")!;
    const mouseRectSize = mouseRigidBody.colliders[0].size;
    mouseRigidBody.transform.position.assign(this.inputManager.mouse).sub(mouseRectSize.clone().divScalar(2));

    const staticRectRigidBody = this.entityManager.getComponent<RigidBody>(this.staticRectId, "rigidBody")!;
    const staticRectSize = staticRectRigidBody.colliders[0].size;
    const staticRectShape = this.entityManager.getComponent<RenderableShape>(this.staticRectId, "renderable")!;

    if (
      areRectsColliding(
        mouseRigidBody.transform.position,
        mouseRectSize,
        staticRectRigidBody.transform.position,
        staticRectSize
      )
    ) {
      staticRectShape.shape!.color = "green";
    } else {
      staticRectShape.shape!.color = "purple";
    }
  }
}

new RectVsRectTest();
