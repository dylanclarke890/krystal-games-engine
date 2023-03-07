import { PQueue } from "../lib/data-structures/p-queue.js";

class GameEventSystem {
  constructor() {
    /** @type {Map<import("../lib/utils/enum.js").Enum, PQueue>} */
    this.subscribers = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {(data:any) => void} listener
   * @param {number} priority
   */
  on(event, listener, priority = 0) {
    if (!this.subscribers.has(event)) this.subscribers.set(event, new PQueue());
    this.subscribers.get(event).add(listener, priority);
  }

  /**
   * Unsubscribe from an event.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {(data:any) => void} listener
   */
  off(event, listener) {
    const queue = this.subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   * @param {import("../lib/utils/enum.js").Enum} event
   * @param {any} data
   */
  dispatch(event, data) {
    const queue = this.subscribers.get(event);
    if (!queue) return;
    queue.forEach((listener) => listener(data));
  }
}

export const EventSystem = new GameEventSystem();
