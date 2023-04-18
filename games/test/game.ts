import { Game } from "../../engine/game.js";

export class TestGame extends Game {
  constructor() {
    super("canvas1", 500, 500);
    this.start();
  }
}
