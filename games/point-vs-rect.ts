import { Game } from "../engine/game.js";
import { InputKeys } from "../engine/input/input-keys.js";

export class PointVsRectTest extends Game {
  constructor() {
    super("canvas1", 500, 500);
    this.inputManager.bind(InputKeys.Mouse_Move, "move");
  }
}

new PointVsRectTest();
