import {
  Bounciness,
  Collision,
  Input,
  Mass,
  Position,
  Size,
  Sprite,
  Velocity,
} from "../../engine/components/index.js";
import { Game } from "../../engine/game.js";
import { CollisionSettings } from "../../engine/utils/types.js";

export class TestGame extends Game {
  constructor() {
    super("canvas1", 500, 500);
    this.#buildEntity(200, 50, 0, 2);
    this.#buildEntity(300, 0, 0, 2);
    this.start();
  }

  #buildEntity(posX: number, velX: number, velY: number, massX: number) {
    const em = this.entityManager;
    const id = em.createEntity();
    em.addComponent(id, new Position(posX, 225));
    em.addComponent(id, new Velocity(velX, velY));
    em.addComponent(id, new Size(50, 50));
    em.addComponent(id, new Sprite("games/test/paddle.png", 50, 50));
    em.addComponent(id, new Bounciness(1));
    em.addComponent(id, new Input(new Map()));
    em.addComponent(id, new Mass(massX));
    const collisionSettings: CollisionSettings = {
      entityCollision: { RIGID: true },
      viewportCollision: { LEFT: true, RIGHT: true, TOP: true, BOTTOM: true },
    };
    em.addComponent(id, new Collision(collisionSettings));
  }
}

new TestGame();
