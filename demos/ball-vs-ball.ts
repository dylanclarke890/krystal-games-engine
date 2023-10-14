import { RenderableShape } from "../engine/components/renderable.js";
import { Circle } from "../engine/components/shape.js";
import { Transform } from "../engine/components/transform.js";
import { KrystalGameEngine } from "../engine/core/engine.js";
import { Vector2 } from "../engine/maths/vector2.js";

export class Game extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);

    const screenWidth = this.gameContext.viewport.width;
    const screenHeight = this.gameContext.viewport.height;
    const defaultRadius = 19;

    this.addBall(screenWidth * 0.25, screenHeight * 0.5, defaultRadius);
    this.addBall(screenWidth * 0.75, screenHeight * 0.5, defaultRadius);

    this.start();
  }

  addBall(x: number, y: number, radius: number): void {
    const em = this.gameContext.entities;
    const id = em.createEntity();

    const transform = new Transform();
    transform.position = new Vector2(x, y);
    em.addComponent(id, new RenderableShape(transform, new Circle(radius, "white")));
  }
}
