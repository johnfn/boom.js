class MagicArray<T> extends Array<T> {
  constructor(contents: T | T[] = undefined) {
    super();

    if (contents) {
      if (contents instanceof Array) {
        for (var a of contents) {
          this.push(a);
        }
      } else {
        this.push(contents as any);
      }
    }
  }

  /**
    Returns a new array with all o removed.
  */
  remove(o: T): MagicArray<T> {
    var result = new MagicArray<T>();

    for (var i = 0; i < this.length; i++) {
      if (this[i] !== o) {
        result.push(this[i]);
      }
    }

    return result;
  }

  each(fn: (o: T) => void): void {
    for (var a of this) {
      fn(a);
    }
  }

  /**
   * Finds the first object in the array that matches the predicate, or null
   * if there isn't one.
   *
   * @param  {key}
   * @return {T}
   */
  find(key: (o: T) => boolean): T {
    for (var a of this) {
      if (key(a)) return a;
    }

    return null;
  }

  /**
   * Finds the maximum object in the array by the given function, or null
   * if the array is empty.
   *
   * @param  {max}
   * @return {T}
   */
  max(fn: (o: T) => number): T {
    let best: T = null;
    let bestNumber: number = Number.NEGATIVE_INFINITY;

    for (const a of this) {
      const val = fn(a);

      if (val > bestNumber) {
        bestNumber = val;
        best = a;
      }
    }

    return best;
  }

  /**
   * Finds the minimum object in the array by the given function, or null
   * if the array is empty.
   *
   * @param  {min}
   * @return {T}
   */
  min(fn: (o: T) => number): T {
    let best: T = null;
    let bestNumber: number = Number.POSITIVE_INFINITY;

    for (const a of this) {
      const val = fn(a);

      if (val < bestNumber) {
        bestNumber = val;
        best = a;
      }
    }

    return best;
  }

  /**
   * Uh... TODO?!?
   *
   * @return {}
   */
  clear(): MagicArray<T> {
    return new MagicArray<T>();
  }

  filter(fn: (o: T) => boolean): MagicArray<T> {
    var result = new MagicArray<T>();

    for (var i = 0; i < this.length; i++) {
      let val = this[i];

      if (fn(val)) {
        result.push(val);
      }
    }

    return result;
  }

  map<U>(fn: (o: T, i: number) => U): MagicArray<U> {
    var result = new MagicArray<U>();

    for (var i = 0; i < this.length; i++) {
      result.push(fn(this[i], i));
    }

    return result;
  }

  /**
   * Sorts by provided key. Returns newly sorted array.
   */
  sortByKey(key: (o: T) => number): MagicArray<T> {
    var result = this
      .slice()
      .sort((a: T, b: T) => key(a) - key(b));

    return new MagicArray<T>(result);
  }

  arr(): T[] {
    var result: T[] = [];

    for (var i = 0; i < this.length; i++) {
      result.push(this[i]);
    }

    return result;
  }

  addAll(o: MagicArray<T>): void {
    for (const item of o) {
      this.push(item);
    }
  }
}
