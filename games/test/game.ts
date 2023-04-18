import {
  Bounciness,
  Collision,
  Input,
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
    this.#buildEntity(50, 50);
    this.#buildEntity(400, -50);
    this.start();
  }

  #buildEntity(posX: number, velX: number) {
    const em = this.entityManager;
    const id = em.createEntity();
    em.addComponent(id, new Position(posX, 300));
    em.addComponent(id, new Velocity(velX, 0));
    em.addComponent(id, new Size(50, 50));
    em.addComponent(id, new Sprite("games/test/paddle.png", 50, 50));
    em.addComponent(id, new Bounciness(1));
    em.addComponent(id, new Input(new Map()));
    const collisionSettings: CollisionSettings = {
      entityCollision: { BOUNCE: true },
      viewportCollision: { LEFT: true, RIGHT: true },
    };
    em.addComponent(id, new Collision(collisionSettings));
  }
}

new TestGame();
