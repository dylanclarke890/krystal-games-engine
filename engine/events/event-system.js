import { PQueue, PriorityLevel } from "../utils/priority-queue.js";
import { Guard } from "../utils/guard.js";

export class EventSystem {
  /** @type {Map<Enum, PQueue>} */
  #subscribers;
  /** @type {EventSystem|undefined} */
  #parent;

  constructor(parent = null) {
    this.#subscribers = new Map();
    if (parent) {
      Guard.isInstanceOf({ parent }, EventSystem);
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
   * @param {Enum} event
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
   * @param {Enum} event
   * @param {(data:any) => void} listener
   */
  off(event, listener) {
    const queue = this.#subscribers.get(event);
    if (!queue) return;
    return queue.remove(listener);
  }

  /**
   * Dispatch an event to subscribers.
   * @param {Enum} event
   * @param {any} data
   */
  dispatch(event, data) {
    const queue = this.#subscribers.get(event);
    if (queue) queue.forEach((listener) => listener(data));
    if (this.#parent) this.#parent.dispatch(event, data);
  }
}
