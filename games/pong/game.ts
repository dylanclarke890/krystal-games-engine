import { Game } from "../../engine/game.js";
import * as Components from "../../engine/components/index.js";
import { InputBindings } from "../../engine/utils/types.js";
import { InputKeys } from "../../engine/input/input-keys.js";
import { EntityManager } from "../../engine/entities/entity-manager.js";

export class TestGame extends Game {
  player!: number;
  opponent!: number;

  constructor() {
    super("canvas1", 500, 500);
    this.inputManager.bind(InputKeys.Arrow_Up, "up");
    this.inputManager.bind(InputKeys.Arrow_Down, "down");
    this.#createPlayer();
    this.#createOpponent();
    this.#createBall();
    this.start();
  }

  #createPlayer() {
    const em = this.entityManager;
    const id = em.createEntity();
    this.player = id;

    const size = new Components.Size(50, 150);
    em.addComponent(id, size);
    em.addComponent(id, new Components.Position(50, this.viewport.height / 2 - size.halfY));
    em.addComponent(id, new Components.Velocity(0, 0));
    em.addComponent(id, new Components.Acceleration(0, 0));
    em.addComponent(id, new Components.Sprite("games/pong/paddle.png", size.x, size.y));

    const collisionSettings = {
      viewportCollision: { TOP: true, BOTTOM: true },
      entityCollision: { WALL: true },
    };
    em.addComponent(id, new Components.Collision(collisionSettings));

    const released = (id: number, em: EntityManager) => {
      const vel = em.getComponent(id, "Velocity")!;
      vel.y = 0;
    };
    const inputBindings = new Map<string, InputBindings>([
      [
        "up",
        {
          held: (id: number, em: EntityManager) => {
            const vel = em.getComponent(id, "Velocity")!;
            vel.y = -50;
          },
          released,
        },
      ],
      [
        "down",
        {
          held: (id: number, em: EntityManager) => {
            const vel = em.getComponent(id, "Velocity")!;
            vel.y = 50;
          },
          released,
        },
      ],
    ]);
    em.addComponent(id, new Components.Input(inputBindings));
  }

  #createOpponent() {
    const em = this.entityManager;
    const id = em.createEntity();
    this.opponent = id;
    const size = new Components.Size(50, 150);
    em.addComponent(
      id,
      new Components.Position(this.viewport.width - 50, this.viewport.height / 2 - size.halfY)
    );
    em.addComponent(id, size);
    const collisionSettings = {
      viewportCollision: { TOP: true, BOTTOM: true },
      entityCollision: { WALL: true },
    };
    em.addComponent(id, new Components.Collision(collisionSettings));
    em.addComponent(id, new Components.Velocity(0, 0));
    em.addComponent(id, new Components.Acceleration(0, 0));
    em.addComponent(id, new Components.Sprite("games/pong/paddle.png", size.x, size.y));
  }

  #createBall() {
    const em = this.entityManager;
    const id = this.createEntity();
    const size = new Components.Size(50, 50);
    em.addComponent(id, size);
    em.addComponent(
      id,
      new Components.Position(
        this.viewport.width / 2 - size.halfX,
        this.viewport.height / 2 - size.halfY
      )
    );
    em.addComponent(id, new Components.Velocity(50, 0));
    em.addComponent(id, new Components.Sprite("games/pong/ball.png", size.x, size.y));
    const collisionSettings = {
      viewportCollision: { TOP: true, BOTTOM: true },
      entityCollision: { BOUNCE: true },
    };
    em.addComponent(id, new Components.Collision(collisionSettings));
  }
}

new TestGame();
