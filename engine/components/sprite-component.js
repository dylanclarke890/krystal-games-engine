import { Assert } from "../utils/assert.js";
import { Guard } from "../utils/guard.js";
import { arrayFromInterval } from "../utils/interval.js";

export class SpriteComponent {
  /**
   * @param {string} path - The source path of the sprite image.
   * @param {number} width - The width of a single sprite frame.
   * @param {number} height - The height of a single sprite frame.
   * @param {number[]|string} sequence - The sequence in which to display frames.
   * Can be an array of numbers or a string in interval notation.
   * @param {number} frameDuration - The duration in seconds for which each frame should
   * be displayed (optional, defaults to 1).
   */
  constructor(path, width, height, sequence, frameDuration, stop) {
    Guard.againstNull({ path });
    Guard.againstNull({ sequence });
    this.image = new Image();
    this.image.addEventListener("load", () => {
      this.columns = Math.floor(this.image.width / width);
    });
    this.image.src = path;
    this.width = width;
    this.height = height;
    this.sequence = Assert.isType(sequence, "string") ? arrayFromInterval(sequence) : sequence;
    this.frameDuration = frameDuration ?? 1;
    this.stop = !!stop;

    this.loopCount = 0;
  }
}
