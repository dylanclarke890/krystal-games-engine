import { Game } from "../../engine/game.js";
import * as Components from "../../engine/components/index.js";
import { InputBindings } from "../../engine/utils/types.js";

export class TestGame extends Game {
  player!: number;
  opponent!: number;

  constructor() {
    super("canvas1", 500, 500);
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
    const inputBindings = new Map<string, InputBindings>([
      [
        "up",
        {
          held: (id, em, dt) => {
            const accel = em.getComponent(id, "Acceleration")!;
            accel.y += 10 * dt;
          },
          released: (id, em) => {
            const accel = em.getComponent(id, "Acceleration")!;
            const vel = em.getComponent(id, "Velocity")!;
            accel.y = 0;
            vel.y = 0;
          },
        },
      ],
      [
        "down",
        {
          held: (id, em, dt) => {
            const accel = em.getComponent(id, "Acceleration");
            if (accel) accel.y -= 10 * dt;
          },
          released: (id, em) => {
            const accel = em.getComponent(id, "Acceleration")!;
            const vel = em.getComponent(id, "Velocity")!;
            accel.y = 0;
            vel.y = 0;
          },
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
