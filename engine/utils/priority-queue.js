import { Enum } from "./enum.js";

export class PriorityLevel extends Enum {
  static {
    /**
     * Used by core functionality, it is not recommended to have events with higher priority
     * levels than Critical unless you know what you're doing.
     */
    this.Critical = new PriorityLevel(1024);
    this.High = new PriorityLevel(768);
    this.Med = new PriorityLevel(512);
    this.Low = new PriorityLevel(256);
    this.None = new PriorityLevel(0);
    this.freeze();
  }
}

export class PQueue {
  /** @type {PQueueItem[]} */
  #list;
  /** @type {(a:PQueueItem, b:PQueueItem) => number} */
  #comparator;

  /** @type {(a:PQueueItem, b:PQueueItem) => number} */
  static #defaultCompareFn = (a, b) => b.priority - a.priority;

  constructor(compareFn) {
    this.#comparator = compareFn || PQueue.#defaultCompareFn;
    this.#list = [];
  }

  add(item, priority) {
    this.#list.push(new PQueueItem(item, priority));
    this.#list.sort(this.#comparator);
  }

  remove(item) {
    const indexOfItem = this.#list.findIndex((v) => v.item === item);
    if (indexOfItem === -1) return false;
    this.#list.splice(indexOfItem, 1);
    return true;
  }

  forEach(cb) {
    for (let i = 0; i < this.#list.length; i++) cb(this.#list[i].item, i);
  }

  get size() {
    return this.#list.length;
  }
}

class PQueueItem {
  /**
   * @param {any} item
   * @param {number} priority
   */
  constructor(item, priority) {
    this.item = item;
    this.priority = priority;
  }
}
