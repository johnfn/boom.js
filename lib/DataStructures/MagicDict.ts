// TODO - maybe look into immutable.js for how they hash js objects, generally speaking.
class MagicDict<Key, Value> {
  private _map: { [key: string]: Value; } = {};
  private _defaultValue: () => Value = null;

  constructor(defaultValue: () => Value = null) {
    this._defaultValue = defaultValue;
  }

  private getHashCode(obj: any) {
    /*
      The following things in JavaScript are not objects:

      * Strings
      * Numbers
      * Booleans
      * null
      * undefined
    */

    let type: string = typeof obj;

    if (type === "string"  ||
        type === "number"  ||
        type === "boolean" ||
        type === "null"    ||
        type == "undefined") {
      return obj;
    }

    if (!obj.__hashcode) {
      Object.defineProperty(obj, '__hashcode', {
        value: "" + Math.random(),
        enumerable: false
      });
    }

    return obj.__hashcode;
  }

  put(key: Key, value: Value): Value {
    let hash = this.getHashCode(key);

    if (this._map[hash] !== undefined && this._map[hash] !== value) {
      console.error("Uh oh, hashing issues.");
    }

    this._map[this.getHashCode(key)] = value;

    return value;
  }

  get(key: Key): Value {
    if (this._defaultValue !== null && !this.contains(key)) {
      return this.put(key, this._defaultValue());
    } 

    return this._map[this.getHashCode(key)];
  }

  contains(key: Key): boolean {
    return this._map[this.getHashCode(key)] !== undefined;
  }

  remove(key: Key): void {
    let hash = this.getHashCode(key);

    if (this.contains(key)) {
      delete this._map[hash];
    } else {
      console.error(key, " not found in MagicDict#remove");
    }
  }
}
