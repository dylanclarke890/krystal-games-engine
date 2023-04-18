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
    this.#buildEntity(50, 30, 3);
    this.#buildEntity(250, -20, 2);
    this.#buildEntity(150, 60, 2);
    this.#buildEntity(400, -70, 1);
    this.start();
  }

  #buildEntity(posX: number, velX: number, massX: number) {
    const em = this.entityManager;
    const id = em.createEntity();
    em.addComponent(id, new Position(posX, 225));
    em.addComponent(id, new Velocity(velX, 0));
    em.addComponent(id, new Size(50, 50));
    em.addComponent(id, new Sprite("games/test/paddle.png", 50, 50));
    em.addComponent(id, new Bounciness(1));
    em.addComponent(id, new Input(new Map()));
    em.addComponent(id, new Mass(massX));
    const collisionSettings: CollisionSettings = {
      entityCollision: { BOUNCE: true },
      viewportCollision: { LEFT: true, RIGHT: true },
    };
    em.addComponent(id, new Collision(collisionSettings));
  }
}

new TestGame();
