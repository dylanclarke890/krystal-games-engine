type CompareFn<T> = (a: PriorityQueueItem<T>, b: PriorityQueueItem<T>) => number;

export class PriorityQueue<T> {
  #list: PriorityQueueItem<T>[];
  #comparator: CompareFn<T>;

  static #defaultCompareFn: CompareFn<any> = (a, b) => b.priority - a.priority;

  constructor(compareFn?: CompareFn<T>) {
    this.#comparator = compareFn || PriorityQueue.#defaultCompareFn;
    this.#list = [];
  }

  add(item: T, priority: number) {
    this.#list.push(new PriorityQueueItem(item, priority));
    this.#list.sort(this.#comparator);
  }

  remove(item: T) {
    const indexOfItem = this.#list.findIndex((v) => v.item === item);
    if (indexOfItem === -1) {
      return false;
    }
    
    this.#list.splice(indexOfItem, 1);
    return true;
  }

  forEach(callbackFn: (value: T, index: number) => void) {
    for (let i = 0; i < this.#list.length; i++) {
      callbackFn(this.#list[i].item, i);
    }
  }

  get size() {
    return this.#list.length;
  }
}

class PriorityQueueItem<T> {
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
