export class MagicArray<T> extends Array<T> {
  constructor(contents: T | T[] = undefined) {
    super();

    if (contents) {
      if (contents instanceof Array) {
        for (const a of contents) {
          this.push(a);
        }
      } else {
        this.push(contents as any);
      }
    }
  }

  /**
   * Returns a new array with all o removed.
   */
  public remove(o: T): MagicArray<T> {
    const result = new MagicArray<T>();

    for (let i = 0; i < this.length; i++) {
      if (this[i] !== o) {
        result.push(this[i]);
      }
    }

    return result;
  }

  public each(fn: (o: T) => void): void {
    for (const a of this) {
      fn(a);
    }
  }

  /**
   * Finds the first object in the array that matches the predicate, or undefined
   * if there isn't one.
   *
   * @param  {key}
   * @return {T}
   */
  public find(key: (o: T) => boolean): T {
    for (const a of this) {
      if (key(a)) { return a; }
    }

    return undefined;
  }

  /**
   * Finds the maximum object in the array by the given function, or undefined
   * if the array is empty.
   *
   * @param  {max}
   * @return {T}
   */
  public max(fn: (o: T) => number): T {
    let best: T = undefined;
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
   * Finds the minimum object in the array by the given function, or undefined
   * if the array is empty.
   *
   * @param  {min}
   * @return {T}
   */
  public min(fn: (o: T) => number): T {
    let best: T = undefined;
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
  public clear(): MagicArray<T> {
    return new MagicArray<T>();
  }

  public filter(fn: (o: T) => boolean): MagicArray<T> {
    const result = new MagicArray<T>();

    for (let i = 0; i < this.length; i++) {
      let val = this[i];

      if (fn(val)) {
        result.push(val);
      }
    }

    return result;
  }

  public map<U>(fn: (o: T, i: number) => U): MagicArray<U> {
    const result = new MagicArray<U>();

    for (let i = 0; i < this.length; i++) {
      result.push(fn(this[i], i));
    }

    return result;
  }

  /**
   * Sorts by provided key. Returns newly sorted array.
   */
  public sortByKey(key: (o: T) => number): MagicArray<T> {
    const result = this
      .slice()
      .sort((a: T, b: T) => key(a) - key(b));

    return new MagicArray<T>(result);
  }

  public arr(): T[] {
    const result: T[] = [];

    for (let i = 0; i < this.length; i++) {
      result.push(this[i]);
    }

    return result;
  }

  public addAll(o: MagicArray<T>): void {
    for (let item of o) {
      this.push(item);
    }
  }
}
