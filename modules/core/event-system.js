import { PQueue, PriorityLevel } from "../lib/data-structures/p-queue.js";
import { Guard } from "../lib/sanity/guard.js";

class GameEventSystem {
  /** @type {Map<import("../lib/utils/enum.js").Enum, PQueue>} */
  #subscribers;
  /** @type {GameEventSystem} */
  #parent;

  constructor(parent = null) {
    this.#subscribers = new Map();
    if (parent) {
      Guard.isInstanceOf({ parent }, GameEventSystem);
      this.#parent = parent;
    }
  }

  /**
   * Get the parent EventSystem.
   */
  get parent() {
    return this.#parent;
  }

  /**
   * Subscribe to an event.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {(data:any) => void} listener
   * @param {number|PriorityLevel} priority
   */
  on(event, listener, priority = PriorityLevel.None) {
    if (!this.#subscribers.has(event)) this.#subscribers.set(event, new PQueue());
    this.#subscribers
      .get(event)
      .add(listener, priority instanceof PriorityLevel ? priority.valueOf() : priority);
  }

  /**
   * Unsubscribe from an event.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {(data:any) => void} listener
   */
  off(event, listener) {
    const queue = this.#subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {any} data
   */
  dispatch(event, data) {
    const queue = this.#subscribers.get(event);
    if (queue) queue.forEach((listener) => listener(data));
    if (this.#parent) this.#parent.dispatch(event, data);
  }
}

export const EventSystem = new GameEventSystem();
