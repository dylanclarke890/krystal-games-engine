/**
 * Provides a way to manage and track time. Supports general timer functionality such as pausing,
 * unpausing and resetting the timer. Timer instances are automatically synced with the global time
 * on each frame.
 */
export class Timer {
  static #last = 0;

  /**
   * @type {number}
   * The maximum allowed time step in seconds.
   */
  static maxStep = 0.05;
  // The global application time in seconds
  static time = Number.MIN_VALUE;
  // A scaling factor applied to the time delta
  static timeScale = 1;

  // The base time of the timer instance in seconds
  base = 0;
  // The last time the tick was called in seconds
  last = 0;
  // The time when the timer was paused in seconds
  pausedAt = 0;
  // The target time in seconds
  target = 0;

  /**
   * Updates the global time using the high-resolution time.
   */
  static step() {
    const current = performance.now();
    const delta = (current - Timer.#last) / 1000;
    Timer.time += Math.min(delta, Timer.maxStep) * Timer.timeScale;
    Timer.#last = current;
  }

  /**
   * Constructs a new Timer instance.
   * @param {number} [seconds=0] - The target time for the timer in seconds.
   */
  constructor(seconds) {
    this.base = Timer.time;
    this.last = Timer.time;
    this.target = seconds || 0;
  }

  /**
   * Sets the target time for the timer and resets the timer.
   * @param {number} [seconds=0] - The target time for the timer in seconds.
   */
  set(seconds) {
    this.target = seconds || 0;
    this.reset();
  }

  /**
   * Resets the timer by setting its base time to the current global time.
   */
  reset() {
    this.base = Timer.time;
    this.pausedAt = 0;
  }

  /**
   * Calculates the time delta since the last tick and updates the last tick time.
   * @returns {number} - The time delta since the last tick in seconds.
   */
  tick() {
    if (this.pausedAt) return 0;
    const delta = Timer.time - this.last;
    this.last = Timer.time;
    return delta;
  }

  /**
   * Calculates the time delta between the timer's base time and its target time.
   * @returns {number} - The time delta between the base and target times in seconds.
   *                     Returns 0 if the base time has not yet reached the target time.
   */
  delta() {
    const d = (this.pausedAt || Timer.time) - this.base - this.target;
    return d < 0 ? 0 : d;
  }

  /**
   * Pauses the timer by setting the pausedAt time to the current global time.
   */
  pause() {
    if (this.pausedAt) return;
    this.pausedAt = Timer.time;
  }

  /**
   * Unpauses the timer by updating the base time and clearing the pausedAt time.
   */
  unpause() {
    if (!this.pausedAt) return;
    this.base += Timer.time - this.pausedAt;
    this.pausedAt = 0;
  }
}
