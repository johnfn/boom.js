class Group<T> {
  dict = new MagicDict<T, boolean>();

  constructor() {

  }

  add(member: T): void {
    this.dict.put(member, true);
  }

  remove(member: T): void {
    this.dict.remove(member);
  }

  contains(member: T): boolean {
    return this.dict.contains(member);
  }
}
