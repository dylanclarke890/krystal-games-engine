import { PriorityQueue } from "../lib/data-structures/priority-queue.js";

// FIXME: PriorityQueue is not suitable as-is.
class GameEventSystem {
  constructor() {
    this.subscribers = new Map();
  }

  static #QueueSortingFn = (listenerA, listenerB) => listenerA.priority - listenerB.priority;

  /**
   *
   * @param {string} event
   * @param {(data:any) => void} listener
   * @param {number} priority
   */
  on(event, listener, priority = 0) {
    if (!this.subscribers.has(event))
      this.subscribers.set(event, new PriorityQueue(GameEventSystem.#QueueSortingFn));
    this.subscribers.get(event).enqueue({ listener, priority });
  }

  /**
   *
   * @param {string} event
   * @param {(data:any) => void} listener
   */
  off(event, listener) {
    const subscribersForEvent = this.subscribers.get(event);
    if (!subscribersForEvent) return;
    const pos = subscribersForEvent.indexOf(listener);
    if (pos !== -1) subscribersForEvent.splice(pos, 1);
  }

  /**
   *
   * @param {string} event
   * @param {any} data
   */
  dispatch(event, data) {
    const subscribersForEvent = this.subscribers.get(event);
    if (!subscribersForEvent) return;
    for (const subscriber of subscribersForEvent) subscriber.listener(data);
  }
}

export const EventSystem = new GameEventSystem();
