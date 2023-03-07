export class PQueue {
  /** @type {PQueueItem[]} */
  #list;
  /** @type {(a:PQueueItem, b:PQueueItem) => number} */
  #comparator;

  /** @type {(a:PQueueItem, b:PQueueItem) => number} */
  static #defaultCompareFn = (a, b) => a.priority - b.priority;

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
