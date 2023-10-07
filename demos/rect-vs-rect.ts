import { GameEvents } from "../engine/constants/enums.js";
import { rectVsRect } from "../engine/physics/collision/detection/detection-strategies.js";
import { RectCollider, Rectangle, RigidBody, RenderableShape } from "../engine/components/2d/index.js";
import { KrystalGameEngine } from "../engine/engine.js";
import { Vector2D } from "../engine/utils/maths/vector-2d.js";

export class RectVsRectTest extends KrystalGameEngine {
  mouseRectId: number;
  staticRectId: number;
  constructor() {
    super("canvas1", 500, 500);
    this.eventManager.on(GameEvents.LOOP_STARTED, () => this.update());
    this.inputManager.enableMouse();

    this.staticRectId = this.#createRect(
      new Vector2D(250, 150),
      new Vector2D(250, 150),
      new Vector2D(50, 200),
      "purple"
    );

    this.mouseRectId = this.#createRect(new Vector2D(), new Vector2D(), new Vector2D(50, 150), "orange");

    this.start();
  }

  #createRect(rigidPosition: Vector2D, shapePosition: Vector2D, size: Vector2D, color: string): number {
    const id = this.entityManager.createEntity();

    const rigidBody = new RigidBody(rigidPosition);
    rigidBody.addCollider(new RectCollider(size));
    const renderable = new RenderableShape(shapePosition, new Rectangle(size, color));

    this.entityManager.addComponent(id, rigidBody);
    this.entityManager.addComponent(id, renderable);

    return id;
  }

  update() {
    const mouseRigidBody = this.entityManager.getComponent<RigidBody>(this.mouseRectId, "rigidBody")!;
    const mouseRectSize = mouseRigidBody.colliders[0].size;
    mouseRigidBody.position.assign(this.inputManager.mouse).sub(mouseRectSize.clone().div(2));
    const mouseRectShape = this.entityManager.getComponent<RenderableShape>(this.mouseRectId, "renderable")!;
    mouseRectShape.position.assign(mouseRigidBody.position);

    const staticRectRigidBody = this.entityManager.getComponent<RigidBody>(this.staticRectId, "rigidBody")!;
    const staticRectSize = staticRectRigidBody.colliders[0].size;
    const staticRectShape = this.entityManager.getComponent<RenderableShape>(this.staticRectId, "renderable")!;

    if (rectVsRect(mouseRigidBody.position, mouseRectSize, staticRectRigidBody.position, staticRectSize)) {
      staticRectShape.shape!.color = "green";
    } else {
      staticRectShape.shape!.color = "purple";
    }
  }
}

new RectVsRectTest();
