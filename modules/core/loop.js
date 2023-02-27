import { $el } from "../lib/utils/dom.js";
import { Guard } from "../lib/sanity/guard.js";
import { Timer } from "./timer.js";

export class GameLoop {
  #lastFrame;

  checkDelegate(delegate) {
    Guard.againstNull({ delegate });
    if (!("nextFrame" in delegate))
      throw new Error("Delegate is not suitable. Delegate should define a 'nextFrame' method.");
  }

  constructor({ delegate, targetFps = 60, stopWith = [] }) {
    this.checkDelegate(delegate);
    this.delegate = delegate;
    this.clock = new Timer();
    this.targetFps = targetFps;
    this.fpsInterval = 1000 / targetFps;
    this.stopWith = stopWith;
    this.#lastFrame = -1;
    this.#bindEvents();
  }

  #bindEvents() {
    for (let i = 0; i < this.stopWith.length; i++)
      $el(this.stopWith[i]).addEventListener("click", () => this.stop());
  }

  start() {
    this.main(performance.now());
  }

  main(timestamp) {
    if (this.stopped) return cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame((t) => this.main(t));

    Timer.step();
    const elapsed = timestamp - this.#lastFrame;
    if (elapsed < this.fpsInterval) return;
    this.#lastFrame = timestamp - (elapsed % this.fpsInterval);

    this.delegate.nextFrame(this.clock.tick());
  }

  stop() {
    this.stopped = true;
  }
}
