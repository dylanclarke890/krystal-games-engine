/**
 * A data structure that you can add pairs of numbers to without worrying about duplicates.
 */
export class PairedSet {
  #set: Set<Pair>;
  #entries: Set<string>;

  constructor() {
    this.#set = new Set();
    this.#entries = new Set();
  }

  get length() {
    return this.#set.size;
  }

  add(pair: Pair) {
    this.#sort(pair);
    const key = `${pair[0]}-${pair[1]}`;
    if (this.#entries.has(key)) return;
    this.#entries.add(key);
    this.#set.add(pair);
  }

  /**
   * Exposes the underlying set for iteration.
   */
  forEach(callbackfn: (value: Pair, value2: Pair, set: Set<Pair>) => void) {
    this.#set.forEach(callbackfn);
  }

  entries() {
    return this.#set.keys();
  }

  clear() {
    this.#set.clear();
    this.#entries.clear();
  }

  #sort(pair: Pair) {
    if (pair[0] > pair[1]) {
      const tmp = pair[0];
      pair[0] = pair[1];
      pair[1] = tmp;
    }
  }
}

type Pair = [number, number];
