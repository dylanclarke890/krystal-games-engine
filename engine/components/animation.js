import { Assert } from "../utils/assert.js";
import { Guard } from "../utils/guard.js";
import { arrayFromInterval } from "../utils/interval.js";

export class Animation {
  /** @type {number[]} */
  sequence;
  /** @type {number} */
  frameDuration;
  /** @type {number} */
  loopCount;
  /** @type {boolean} */
  stop;

  /**
   * @param {number[]|string} sequence - The sequence in which to display frames.
   * Can be an array of numbers or a string in interval notation (if the frames to represent are contiguous).
   * @param {number} frameDuration - The duration in seconds for which each frame should
   * be displayed (optional, defaults to 1).
   * @param {boolean} stop - Will stop on the last frame if true.
   */
  constructor(sequence, frameDuration, stop) {
    Guard.againstNull({ sequence });
    this.sequence = Assert.isType(sequence, "string") ? arrayFromInterval(sequence) : sequence;
    this.frameDuration = frameDuration ?? 1;
    this.stop = !!stop;

    this.loopCount = 0;
  }
}