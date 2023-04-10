/**
 * A data structure that you can add pairs of numbers to without worrying about duplicates.
 */
export class PairedSet {
  /** @type {Set<[number, number]} */
  #set;
  /** @type {Map<string, boolean>} */
  #entries;

  constructor() {
    this.#set = new Set();
    this.#entries = new Map();
  }

  get length() {
    return this.#set.size;
  }

  /** @param {[number, number]} pair */
  add(pair) {
    this.#sort(pair);
    const key = `${pair[0]}-${pair[1]}`;
    if (this.#entries.has(key)) return;
    this.#entries.set(key, true);
    this.#set.add(pair);
  }

  /**
   * Exposes the underlying set for iteration.
   * @param {(value: T, value2: T, set: Set<T>) => void} callbackfn
   */
  forEach(callbackfn) {
    this.#set.forEach(callbackfn);
  }

  entries() {
    return this.#set.keys();
  }

  clear() {
    this.#set.clear();
    this.#entries.clear();
  }

  #sort(pair) {
    if (pair[0] > pair[1]) {
      const tmp = pair[0];
      pair[0] = pair[1];
      pair[1] = tmp;
    }
  }
}
