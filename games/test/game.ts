import { GravityFactor, Position, Shape, Velocity } from "../../engine/components/index.js";
import { GameEvents } from "../../engine/events/events.js";
import { Game } from "../../engine/game.js";
import { InputKeys } from "../../engine/input/input-keys.js";

// Create balls onmousedown that fall down the screen
// They should bounce after hitting the bottom
// They should collide off of each other

export class TestGame extends Game {
  constructor() {
    super("canvas1", 500, 500);
    this.inputManager.bind(InputKeys.Mouse_BtnOne, "create");
    this.eventSystem.on(GameEvents.Loop_NextFrame, () => this.update());
    this.start();
  }

  update() {
    const em = this.entityManager;
    if (this.inputManager.held("create")) {
      const { x, y } = this.inputManager.mouse;
      const color = `#${Math.floor(x)}${Math.floor(y)}`;

      const newEntity = em.createEntity();
      em.addComponent(newEntity, new Position(x, y));
      em.addComponent(newEntity, new Shape("circle", color, { radius: 6 }));
      em.addComponent(newEntity, new Velocity(0, 10));
      em.addComponent(newEntity, new GravityFactor());
    }
  }
}

new TestGame();
