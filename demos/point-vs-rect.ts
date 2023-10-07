import { RectCollider, Rectangle, RigidBody, RenderableShape } from "../engine/components/2d/index.js";
import { KrystalGameEngine } from "../engine/engine.js";
import { Vector2D } from "../engine/utils/maths/vector-2d.js";
import { GameEvents } from "../engine/constants/enums.js";
import { pointVsRect } from "../engine/physics/collision/index.js";

export class PointVsRectTest extends KrystalGameEngine {
  rectId!: number;

  constructor() {
    super("canvas1", 500, 500);

    this.inputManager.enableMouse();
    this.eventManager.on(GameEvents.LOOP_STARTED, () => this.update());

    this.#createRect();
    this.start();
  }

  #createRect() {
    const id = this.entityManager.createEntity();
    const position = new Vector2D(200, 200);
    const size = new Vector2D(50, 200);

    const rigidBody = new RigidBody(position);
    rigidBody.addCollider(new RectCollider(size));
    const renderable = new RenderableShape(position, new Rectangle(size, "purple"));

    this.rectId = id;
    this.entityManager.addComponent(id, rigidBody);
    this.entityManager.addComponent(id, renderable);
  }

  update(): void {
    const rectRigidBody = this.entityManager.getComponent<RigidBody>(this.rectId, "rigidBody");
    const rectCollider = rectRigidBody!.colliders[0];
    const rectShape = this.entityManager.getComponent<RenderableShape>(this.rectId, "renderable");

    if (pointVsRect(this.inputManager.mouse, rectRigidBody!.position, rectCollider!.size)) {
      rectShape!.shape!.color = "green";
    } else {
      rectShape!.shape!.color = "purple";
    }
  }
}

new PointVsRectTest();
