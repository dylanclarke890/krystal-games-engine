const defaultcomparator = (a, b) => a < b;

export class PriorityQueue {
  // the provided comparator function should take a, b and return *true* when a < b
  constructor(comparator, array, size) {
    this.array = array || [];
    this.size = size || 0;
    this.compare = comparator || defaultcomparator;
  }

  /** Copy the priority queue into another, and return it. Queue items are shallow-copied (O(n) complexity). */
  clone() {
    return new PriorityQueue(this.compare, this.array.slice(0, this.size), this.size);
  }

  /** Add an element into the queue (O(log n) complexity).*/
  add(value) {
    let i = this.size;
    this.array[this.size] = value;
    this.size += 1;
    let p;
    let ap;
    while (i > 0) {
      p = (i - 1) >> 1;
      ap = this.array[p];
      if (!this.compare(value, ap)) {
        break;
      }
      this.array[i] = ap;
      i = p;
    }
    this.array[i] = value;
  }

  /** Replace the content of the heap by provided array and "heapify it" */
  heapify(arr) {
    this.array = arr;
    this.size = arr.length;
    for (let i = this.size >> 1; i >= 0; i--) this.#siftDown(i);
  }

  #siftUp(i, force) {
    const value = this.array[i];
    while (i > 0) {
      const p = (i - 1) >> 1;
      const ap = this.array[p];
      if (!force && !this.compare(value, ap)) break; // force will skip the compare
      this.array[i] = ap;
      i = p;
    }
    this.array[i] = value;
  }

  #siftDown(i) {
    const size = this.size;
    const hsize = this.size >>> 1;
    const ai = this.array[i];

    while (i < hsize) {
      let l = (i << 1) + 1;
      const r = l + 1;
      let bestc = this.array[l];
      if (r < size) {
        if (this.compare(this.array[r], bestc)) {
          l = r;
          bestc = this.array[r];
        }
      }
      if (!this.compare(bestc, ai)) break;
      this.array[i] = bestc;
      i = l;
    }
    this.array[i] = ai;
  }

  /** Will remove the item at the given index from the queue, retaining balance.
   *  Returns the removed item, or undefined if nothing is removed. */
  #removeAt(index) {
    if (index > this.size - 1 || index < 0) return undefined;
    this.#siftUp(index, true);
    return this.poll();
  }

  /** Will remove an item matching the provided value from the queue, checked
   *  for equality by using the queue's comparator.
   *  @returns {boolean} True if removed.  */
  remove(value) {
    for (let i = 0; i < this.size; i++) {
      if (!this.compare(this.array[i], value) && !this.compare(value, this.array[i])) {
        // items match, comparator returns false both ways, remove item
        this.#removeAt(i);
        return true;
      }
    }
    return false;
  }

  /** Will execute the callback function for each item of the queue and will remove
   *  the first item for which the callback will return true.
   *  @returns {any | null} The removed item, or undefined if nothing is removed. */
  removeOne(callback) {
    if (typeof callback !== "function") return undefined;
    for (let i = 0; i < this.size; i++) if (callback(this.array[i])) return this.#removeAt(i);
  }

  /** Will execute the callback function for each item of
   * the queue and will remove each item for which the callback returns true, up to
   * a max limit of removed items if specified or no limit if unspecified.
   * @returns An array containing the removed items. The callback function should be a pure function. */
  removeMany(callback, limit) {
    if (typeof callback !== "function" || this.size < 1) return [];
    limit = limit ? Math.min(limit, this.size) : this.size;

    // Prepare the results container to hold up to the results limit
    let resultSize = 0;
    const result = new Array.from({ length: limit });

    // Prepare a temporary array to hold items we'll traverse through and need to keep
    let tmpSize = 0;
    const tmp = new Array.from({ length: this.size });

    while (resultSize < limit && !this.isEmpty()) {
      // Dequeue items into either the results or our temporary array
      const item = this.poll();
      if (callback(item)) result[resultSize++] = item;
      else tmp[tmpSize++] = item;
    }

    // Update the result array with the exact number of results
    result.length = resultSize;

    // Re-add all the items we can keep
    let i = 0;
    while (i < tmpSize) this.add(tmp[i++]);
    return result;
  }

  /** Look at the top of the queue (one of the smallest elements) without removing it.*/
  peek() {
    return this.size === 0 ? undefined : this.array[0];
  }

  /** Remove the element on top of the heap (one of the smallest elements).
   * For long-running and large priority queues, or priority queues storing large objects,
   * you may  want to call the trim function at strategic times to recover allocated memory. */
  poll() {
    if (this.size === 0) return undefined;
    const value = this.array[0];
    if (this.size > 1) {
      this.array[0] = this.array[--this.size];
      this.#siftDown(0);
    } else this.size -= 1;

    return value;
  }

  /** Add the provided value to the heap, while removing and returning one of the smallest elements (like poll).
   *  The size of the queue remains unchanged. */
  replaceTop(value) {
    if (this.size == 0) return undefined;
    const top = this.array[0];
    this.array[0] = value;
    this.#siftDown(0);
    return top;
  }

  /** recover unused memory (for long-running priority queues) */
  trim() {
    this.array = this.array.slice(0, this.size);
  }

  /** Check whether the heap is empty */
  isEmpty() {
    return this.size === 0;
  }

  forEach(callback) {
    if (this.isEmpty() || typeof callback !== "function") return;
    let i = 0;
    const pq = this.clone();
    while (!pq.isEmpty()) callback(pq.poll(), i++);
  }

  /**
   * Get the k 'smallest' elements of the queue as an array, runs in O(k log k) time,
   * the elements are not removed from the priority queue.  */
  kSmallest(k) {
    if (this.size == 0 || k <= 0) return [];
    k = Math.min(this.size, k);
    const newSize = Math.min(this.size, (1 << (k - 1)) + 1);
    if (newSize < 2) return [this.peek()];

    const pq = new PriorityQueue(this.compare, this.array.slice(0, newSize), newSize);

    const smallest = new Array(k);
    for (let i = 0; i < k; i++) smallest[i] = pq.poll();
    return smallest;
  }
}
