/**
 * Maybe type in the spirit of Haskell to indicate nullable types. It doesn't have all the Monadic coolness of Haskell,
 * but it indicates nullable types pretty well.
 */
export class Maybe<T> {
  public hasValue: boolean = false;
  private _value: T;

  constructor(value: T = undefined) {
    if (value === null) {
      console.error('Never do this.');
    }

    this.value = value;
  }

  public then(value: (val: T) => void, nothing: () => void = undefined): void {
    if (this.hasValue) {
      value(this.value);
    } else if (nothing !== undefined) {
      nothing();
    }
  }

  get value(): T {
    if (this.hasValue) {
      return this._value;
    }

    console.error('asked for value of Maybe without a value');
  }

  set value(value: T) {
    if (value === null) {
      console.error('Never do this.');
    }

    this._value = value;

    this.hasValue = value !== undefined;
  }
}