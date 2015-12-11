class Group<T> {
  private _length: number = 0;

  private _dict: MagicDict<T, boolean>;

  constructor() {
    this._dict = new MagicDict<T, boolean>();
  }

  add(member: T): void {
    this._dict.put(member, true);
  }

  remove(member: T): void {
    this._dict.remove(member);
  }

  contains(member: T): boolean {
    return this._dict.contains(member);
  }

  all(): T[] {
    return this._dict.keys();
  }

  length(): number {
    return this._dict.length();
  }
}
