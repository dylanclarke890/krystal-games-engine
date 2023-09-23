import { Assert } from "../../utils/assert.js";
import { arrayFromInterval } from "../../utils/maths/interval.js";

export class Animation {
  sequence: number[];
  frameDuration: number;
  frame: number;
  loopCount: number;
  stop: boolean;

  /**
   * @param sequence - The sequence in which to display frames.
   * Can be an array of numbers or a string in interval notation (if the frames to represent are contiguous).
   * @param frameDuration - The duration in seconds for which each frame should
   * be displayed (optional, defaults to 1).
   * @param stop - Will stop on the last frame if true.
   */
  constructor(sequence: Nullable<number[] | string>, frameDuration: number, stop: boolean) {
    Assert.defined("sequence", sequence);
    this.sequence = typeof sequence === "string" ? arrayFromInterval(sequence) : sequence;
    this.frameDuration = frameDuration ?? 1;
    this.stop = !!stop;

    this.frame = 0;
    this.loopCount = 0;
  }
}
