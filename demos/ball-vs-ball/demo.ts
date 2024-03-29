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
// import { randomInt } from "../../engine/maths/number.js";
import { Vector2 } from "../../engine/maths/vector2.js";
import { CollisionInfoSystem } from "./collision-info-system.js";
import { InteractiveSystem } from "./interactive-system.js";

export class ShapeVsShape extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);
    this.gameContext.systems.addSystem(new InteractiveSystem(this.gameContext));
    this.gameContext.systems.addSystem(new CollisionInfoSystem(this.gameContext, this.physicsContext));

    // const screenWidth = this.gameContext.viewport.width;
    const screenHeight = this.gameContext.viewport.height;
    const defaultRadius = 20;
    // for (let i = 0; i < 10; i++) {
    //   this.addBall(randomInt(0, screenWidth), randomInt(0, screenHeight), defaultRadius, false);
    // }

    // this.addBall(0, 0, defaultRadius, false);
    const a = this.addBall(200, screenHeight * 0.5, defaultRadius, false);
    a.velocity.x = 50;
    a.mass = 5;
    const b = this.addBall(400, screenHeight * 0.5, defaultRadius, false);
    b.velocity.x = -25;
    b.mass = 10;
    this.physicsContext.world.gravity.y = 0;

    this.start();
  }

  addBall(x: number, y: number, size: number, isRect: boolean): RigidBody {
    const em = this.gameContext.entities;
    const id = em.createEntity();
    const transform = new Transform();
    transform.position = new Vector2(x, y);

    const material = new PhysicsMaterial();
    const collider = isRect
      ? new RectCollider(new Transform(), material, new Vector2(size, size))
      : new CircleCollider(new Transform(), material, size);
    const rigidBody = new RigidBody(transform, collider);
    rigidBody.mass = size * 10;
    rigidBody.damping = 0.0;


    const renderableShape = new RenderableShape(
      transform,
      isRect ? new Rectangle(new Vector2(size, size), "white") : new Circle(size, "white")
    );

    em.addComponent(id, renderableShape);
    em.addComponent(id, rigidBody);

    return rigidBody;
  }
}
