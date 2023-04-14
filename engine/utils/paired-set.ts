type Pair<T> = [T, T];

/**
 * A data structure that you can add pairs of primitives to without worrying about duplicates.
 */
export class PairedSet<T extends number | string | boolean> {
  #set: Pair<T>[];
  #entries: Set<string>;

  constructor() {
    this.#set = [];
    this.#entries = new Set();
  }

  get length() {
    return this.#set.length;
  }

  add(pair: Pair<T>) {
    this.#sort(pair);
    const key = `${pair[0]}-${pair[1]}`;
    if (this.#entries.has(key)) return;
    this.#entries.add(key);
    this.#set.push(pair);
  }

  /**
   * Exposes the underlying set for iteration.
   */
  forEach(callbackfn: (value: Pair<T>, index: number) => void) {
    for (let i = 0; i < this.#set.length; i++) {
      callbackfn(this.#set[i], i);
    }
    this.#set.forEach(callbackfn);
  }

  [Symbol.iterator]() {
    return this.#set[Symbol.iterator]();
  }

  entries() {
    return this.#set.keys();
  }

  clear() {
    this.#set.length = 0;
    this.#entries.clear();
  }

  #sort(pair: Pair<T>) {
    if (pair[0] > pair[1]) {
      const tmp = pair[0];
      pair[0] = pair[1];
      pair[1] = tmp;
    }
  }
}
