import { Composite } from '../Core.ts'

export class Group<T extends Composite> {
  private _length: number = 0;

  private _dict: { [key: string]: T } = {};

  private _vals: T[] = [];

  constructor(...members: T[][]) {
    if (members !== undefined) {
      for (const membersList of members) {
        for (const member of membersList) {
          this.add(member);
        }
      }
    }
  }

  public add(member: T): void {
    this._dict[member.hash] = member;
    this._vals.push(member);
    this._length++;
  }

  public remove(member: T): void {
    delete this._dict[member.hash];
    this._vals.splice(this._vals.indexOf(member), 1);
    this._length--;
  }

  public contains(member: T): boolean {
    return !!this._dict[member.hash];
  }

  public items(): T[] {
    return this._vals;
  }

  public length(): number {
    return this._length;
  }
}
