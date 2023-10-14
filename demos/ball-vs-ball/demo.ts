import {
  CircleCollider,
  PhysicsMaterial,
  RenderableShape,
  RigidBody,
  Circle,
  Transform,
} from "../../engine/components/index.js";
import { KrystalGameEngine } from "../../engine/core/engine.js";
import { Vector2 } from "../../engine/maths/vector2.js";
import { InteractiveSystem } from "./interactive-system.js";

export class Game extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);
    this.gameContext.systems.addSystem(new InteractiveSystem(this.gameContext));

    const screenWidth = this.gameContext.viewport.width;
    const screenHeight = this.gameContext.viewport.height;
    const defaultRadius = 20;

    this.addBall(screenWidth * 0.25, screenHeight * 0.5, defaultRadius);
    this.addBall(screenWidth * 0.75, screenHeight * 0.5, defaultRadius);

    this.start();
  }

  addBall(x: number, y: number, radius: number): void {
    const em = this.gameContext.entities;

    const id = em.createEntity();
    const transform = new Transform();
    transform.position = new Vector2(x, y);
    const rigidBody = new RigidBody(transform);
    rigidBody.addCollider(new CircleCollider(new Transform(), new PhysicsMaterial(), radius));

    em.addComponent(id, new RenderableShape(transform, new Circle(radius, "white")));
    em.addComponent(id, rigidBody);
  }
}
