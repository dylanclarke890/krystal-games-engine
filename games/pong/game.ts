import { Game } from "../../engine/game.js";
import * as Components from "../../engine/components/index.js";
import { InputBindings } from "../../engine/utils/types.js";

export class TestGame extends Game {
  player!: number;

  constructor() {
    super("canvas1", 500, 500);
    this.#createPlayer();
    this.#createTestEntity(450, -100);
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
    em.addComponent(id, new Components.Sprite("games/pong/player-paddle.png", size.x, size.y));
  }

  #createTestEntity(posX: number, speedX: number) {
    const em = this.entityManager;
    const entity = em.createEntity();

    const rnd = Math.random();
    const sequence = rnd > 0.5 ? "[0,3]" : "[3, 0]";
    const bindings = new Map<string, InputBindings>([
      [
        "move-left",
        {
          pressed: (e) => console.log(`${e} pressed left.`),
          held: (e) => console.log(`${e} is moving left.`),
          released: (e) => console.log(`${e} released left.`),
        },
      ],
      [
        "move-right",
        {
          pressed: (e) => console.log(`${e} pressed right.`),
          held: (e) => console.log(`${e} is moving right.`),
          released: (e) => console.log(`${e} released right.`),
        },
      ],
    ]);
    const collisionSettings = {
      viewportCollision: { LEFT: true, RIGHT: true },
      entityCollision: { BOUNCE: true },
    };

    em.addComponent(entity, new Components.Position(posX, 50));
    em.addComponent(entity, new Components.Velocity(speedX, 0));
    em.addComponent(entity, new Components.Bounciness(1));
    em.addComponent(entity, new Components.GravityFactor(0)); // TODO - unused
    em.addComponent(entity, new Components.Friction(1, 1)); // TODO - unused
    em.addComponent(entity, new Components.Sprite("test-data/assets/multi-square.png", 32, 32));
    em.addComponent(entity, new Components.Animation(sequence, rnd, false));
    em.addComponent(entity, new Components.Input(bindings));
    em.addComponent(entity, new Components.Collision(collisionSettings));
  }
}

new TestGame();
