import { Enum } from "./enum.js";

export class PriorityLevel extends Enum {
  /**
   * Used by core functionality, it is not recommended to have events with higher priority
   * levels than Critical unless you know what you're doing.
   */
  static Critical = new PriorityLevel(1024);
  static High = new PriorityLevel(768);
  static Med = new PriorityLevel(512);
  static Low = new PriorityLevel(256);
  static None = new PriorityLevel(0);

  static {
    this.freeze();
  }
}

type CompareFn<T> = (a: PQueueItem<T>, b: PQueueItem<T>) => number;

export class PQueue<T> {
  #list: PQueueItem<T>[];
  #comparator: CompareFn<T>;

  static #defaultCompareFn: CompareFn<any> = (a, b) => b.priority - a.priority;

  constructor(compareFn?: CompareFn<T>) {
    this.#comparator = compareFn || PQueue.#defaultCompareFn;
    this.#list = [];
  }

  add(item: T, priority: number) {
    this.#list.push(new PQueueItem(item, priority));
    this.#list.sort(this.#comparator);
  }

  remove(item: T) {
    const indexOfItem = this.#list.findIndex((v) => v.item === item);
    if (indexOfItem === -1) return false;
    this.#list.splice(indexOfItem, 1);
    return true;
  }

  forEach(callbackFn: (value: T, index: number) => void) {
    for (let i = 0; i < this.#list.length; i++) callbackFn(this.#list[i].item, i);
  }

  get size() {
    return this.#list.length;
  }
}

class PQueueItem<T> {
  item: T;
  priority: number;

  /**
   * @param {T} item
   * @param {number} priority
   */
  constructor(item: T, priority: number) {
    this.item = item;
    this.priority = priority;
  }
}
