import { Entity } from "../modules/core/entity.js";
import { Align } from "../modules/core/assets/font.js";
import { KrystalGame } from "../modules/core/game.js";
import { Register } from "../modules/core/register.js";
import { GameRunner } from "../modules/core/runner.js";

class TestPlayer extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 24, y: 8 };
    this.createAnimationSheet("./test-data/assets/entities/mover.png", { x: 24, y: 8 });
    this.addAnim("standard", 1, [0], true);
  }

  draw() {
    super.draw();
  }
}

class TestGame extends KrystalGame {
  constructor(opts) {
    super(opts);
    this.spawnEntity(TestPlayer, 100, 100);
    console.log(this.entities);
  }

  draw() {
    super.draw();
    this.fonts.standard.write("Working!", 250, 250, {
      align: Align.Center,
      color: "green",
    });
  }
}

Register.entityTypes(TestPlayer);
Register.preloadImages("./test-data/assets/entities/mover.png");

new GameRunner({
  gameClass: TestGame,
  canvasId: "canvas1",
  width: 500,
  height: 500,
  scale: 2,
  fonts: { standard: "./test-data/assets/arcade-classic.TTF" },
});
