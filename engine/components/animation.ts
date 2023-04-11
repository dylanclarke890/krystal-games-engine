import { Assert } from "../utils/assert";
import { Guard } from "../utils/guard";
import { arrayFromInterval } from "../utils/interval";

export class Animation {
  sequence: number[];
  frameDuration: number;
  frame: number;
  loopCount: number;
  stop: boolean;

  /**
   * @param {number[]|string} sequence - The sequence in which to display frames.
   * Can be an array of numbers or a string in interval notation (if the frames to represent are contiguous).
   * @param {number} frameDuration - The duration in seconds for which each frame should
   * be displayed (optional, defaults to 1).
   * @param {boolean} stop - Will stop on the last frame if true.
   */
  constructor(sequence: number[] | string, frameDuration: number, stop: boolean) {
    Guard.againstNull({ sequence });
    this.sequence = Assert.isType(sequence, "string")
      ? arrayFromInterval(sequence as string)
      : (sequence as number[]);
    this.frameDuration = frameDuration ?? 1;
    this.stop = !!stop;

    this.frame = 0;
    this.loopCount = 0;
  }
}
