

abstract class Component {
  private _sprite: Sprite;

  constructor() {
  }

  public init(sprite: Sprite) {
    this._sprite = sprite;
  }

  /**
   * These methods have not been thought through or implemented on the Sprite yet.
   */
  public abstract preUpdate(): void;
  public abstract update(): void;
  public abstract postUpdate(): void;
}