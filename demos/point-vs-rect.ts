import { RectCollider, Rectangle, RigidBody, RenderableShape, Transform } from "../engine/components/2d/index.js";
import { KrystalGameEngine } from "../engine/engine.js";
import { Vector2D } from "../engine/maths/vector-2d.js";
import { GameEvents } from "../engine/constants/enums.js";
import { isPointCollidingWithRect } from "../engine/physics/collision/index.js";

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
    const size = new Vector2D(50, 200);

    const transform = new Transform();
    transform.position = new Vector2D(200, 200);

    const rigidBody = new RigidBody(transform);
    rigidBody.addCollider(new RectCollider(size));

    this.rectId = id;
    this.entityManager.addComponent(id, transform);
    this.entityManager.addComponent(id, rigidBody);
    this.entityManager.addComponent(id, new RenderableShape(transform, new Rectangle(size, "purple")));
  }

  update(): void {
    const rectRigidBody = this.entityManager.getComponent<RigidBody>(this.rectId, "rigidBody");
    const rectCollider = rectRigidBody!.colliders[0];
    const rectShape = this.entityManager.getComponent<RenderableShape>(this.rectId, "renderable");

    if (isPointCollidingWithRect(this.inputManager.mouse, rectRigidBody!.transform.position, rectCollider!.size)) {
      rectShape!.shape!.color = "green";
    } else {
      rectShape!.shape!.color = "purple";
    }
  }
}

new PointVsRectTest();
