import { Position, Shape } from "../../engine/components/index.js";
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
    const { x, y } = this.inputManager.mouse;

    if (this.inputManager.held("create")) {
      const newEntity = em.createEntity();
      em.addComponent(newEntity, new Position(x, y));
      em.addComponent(newEntity, new Shape("circle", "red", { radius: 2 }));
    }
  }
}

new TestGame();
