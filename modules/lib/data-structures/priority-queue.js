export class PriorityQueue {
  /** @type {Function} */
  #sortFn;
  /** @type {any[]} */
  #heap;

  constructor(sortFn) {
    this.#heap = [];
    this.#sortFn = sortFn;
  }

  enqueue(value) {
    this.#heap.push(value);
    this.#siftUp();
  }

  dequeue() {
    const first = this.#heap[0];
    const last = this.#heap.pop();
    if (this.#heap.length > 0) {
      this.#heap[0] = last;
      this.#siftDown();
    }
    return first;
  }

  [Symbol.iterator]() {
    let index = 0;
    const heap = this.#heap;
    return {
      next: () => (index < heap.length ? { value: heap[index++], done: false } : { done: true }),
    };
  }

  peek() {
    return this.#heap[0];
  }

  get length() {
    return this.#heap.length;
  }

  #siftUp() {
    let node = this.#heap.length - 1;
    while (node > 0) {
      const parent = (node - 1) >> 1;
      if (this.#sortFn(this.#heap[node], this.#heap[parent]) > 0) {
        [this.#heap[node], this.#heap[parent]] = [this.#heap[parent], this.#heap[node]];
        node = parent;
      } else break;
    }
  }

  #siftDown() {
    let node = 0;
    while (node * 2 + 1 < this.#heap.length) {
      const left = node * 2 + 1;
      const right = node * 2 + 2;
      const maxChild =
        right < this.#heap.length && this.#sortFn(this.#heap[right], this.#heap[left]) > 0
          ? right
          : left;
      if (this.#sortFn(this.#heap[maxChild], this.#heap[node]) > 0) {
        [this.#heap[node], this.#heap[maxChild]] = [this.#heap[maxChild], this.#heap[node]];
        node = maxChild;
      } else break;
    }
  }
}
