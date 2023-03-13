import { TextAlign } from "../modules/core/assets/font.js";
import { KrystalGame } from "../modules/core/game.js";
import { Register } from "../modules/core/register.js";
import { GameRunner } from "../modules/core/runner.js";
import { Player } from "./entities/entities.js";

class TestGame extends KrystalGame {
  constructor(opts) {
    super(opts);
    this.spawnEntity(Player, 100, 100);
  }

  draw() {
    super.draw();
    this.fonts.standard.write("Working!", 250, 250, {
      align: TextAlign.Center,
      color: "green",
    });
  }
}

Register.preloadImages("./test-data/assets/entities/mover.png");

new GameRunner({
  gameClass: TestGame,
  canvasId: "canvas1",
  width: 500,
  height: 500,
  scale: 1,
  fonts: { standard: "./test-data/assets/arcade-classic.TTF" },
});
