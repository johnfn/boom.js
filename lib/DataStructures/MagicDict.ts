// TODO - maybe look into immutable.js for how they hash js objects, generally speaking.
class MagicDict<Key, Value> {
  private _map: { [key: string]: Value; } = {};

  private _hashToKey: { [key: string]: Key; } = {};

  private _defaultValue: () => Value = undefined;

  private _length: number = 0;

  private _keys: Key[] = [];

  constructor(defaultValue: () => Value = undefined) {
    this._defaultValue = defaultValue;
  }

  public put(key: Key, value: Value): Value {
    const hash = this._getHashCode(key);

    /*
    Uh...this test is wrong.

    Idk how it's wrong, but it's wrong.

    if (this._map[hash] !== undefined && this._map[hash] !== value) {
      console.error("Uh oh, hashing issues.");

      return;
    }
    */

    if (this._map[hash] === undefined) {
      this._length++;
      this._keys.push(key);
    }

    this._map[hash]       = value;
    this._hashToKey[hash] = key;

    return value;
  }

  public length(): number {
    return this._length;
  }

  public get(key: Key): Value {
    if (this._defaultValue !== undefined && !this.contains(key)) {
      return this.put(key, this._defaultValue());
    }

    return this._map[this._getHashCode(key)];
  }

  public contains(key: Key): boolean {
    return this._map[this._getHashCode(key)] !== undefined;
  }

  public remove(key: Key): void {
    let hash = this._getHashCode(key);

    if (this.contains(key)) {
      this._length--;

      delete this._hashToKey[hash];
      delete this._map[hash];

      this._keys.splice(this._keys.indexOf(key), 1);
    } else {
      console.error(key, ' not found in MagicDict#remove');
    }
  }

  public keys(): Key[] {
    return this._keys;
  }

  private _getHashCode(obj: any): string {
    /*
      The following things in JavaScript are not objects:

      * Strings
      * Numbers
      * Booleans
      * null
      * undefined
    */

    let type: string = typeof obj;

    if (type === 'string'  ||
        type === 'number'  ||
        type === 'boolean' ||
        type === 'null'    ||
        type === 'undefined') {
      return String(obj);
    }

    if (!obj.__hashcode) {
      Object.defineProperty(obj, '__hashcode', {
        enumerable: false,
        value: '' + Math.random(),
      });
    }

    return obj.__hashcode;
  }
}
