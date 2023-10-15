import {
  CircleCollider,
  PhysicsMaterial,
  RenderableShape,
  RigidBody,
  Circle,
  Transform,
  Rectangle,
  RectCollider,
} from "../../engine/components/index.js";
import { KrystalGameEngine } from "../../engine/core/engine.js";
import { Vector2 } from "../../engine/maths/vector2.js";
import { ShapeVsShapeSystem } from "./interactive-system.js";

export class ShapeVsShape extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);
    this.gameContext.systems.addSystem(new ShapeVsShapeSystem(this.gameContext));

    const screenWidth = this.gameContext.viewport.width;
    const screenHeight = this.gameContext.viewport.height;
    const defaultRadius = 20;

    this.addBall(0, 0, defaultRadius, true);
    this.addBall(screenWidth * 0.25, screenHeight * 0.5, defaultRadius, true);
    this.addBall(screenWidth * 0.75, screenHeight * 0.5, defaultRadius, true);
    this.physicsContext.world.gravity.y = 0;

    this.start();
  }

  addBall(x: number, y: number, size: number, isRect: boolean): void {
    const em = this.gameContext.entities;
    const id = em.createEntity();
    const transform = new Transform();
    transform.position = new Vector2(x, y);

    const rigidBody = new RigidBody(transform);
    const material = new PhysicsMaterial();
    const collider = isRect
      ? new RectCollider(new Transform(), material, new Vector2(size, size))
      : new CircleCollider(new Transform(), material, size);
    rigidBody.addCollider(collider);

    const renderableShape = new RenderableShape(
      transform,
      isRect ? new Rectangle(new Vector2(size, size), "white") : new Circle(size, "white")
    );

    em.addComponent(id, renderableShape);
    em.addComponent(id, rigidBody);
  }
}
