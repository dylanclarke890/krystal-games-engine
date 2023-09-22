import { Game } from "../engine/game.js";

export class RectVsRectTest extends Game {
  constructor() {
    super("canvas1", 500, 500);
    this.inputManager.enableMouse();
  }
}
