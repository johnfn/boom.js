abstract class Component<T extends Composite> {
  protected _sprite: T;

  private _hasInited: boolean = false;

  constructor() { }

  /**
   * Put component initialization logic here. Called once the Composite is
   * fully initialized.
   */
  public init(): void { }

  public setTarget(sprite: T): void {
    this._sprite = sprite;
  }

  public preUpdate(): void { };

  /**
   * God help you if you override this method and forget to call super.
   */
  public update(): void {
    // If update() has been called then this object has been fully initialized. init() it.

    if (!this._hasInited) {
      this._hasInited = true;

      this.init();
    }
  }

  public postUpdate(): void { };

  /**
   * Override to implement cleanup logic when the sprite with this component
   * gets destroyed.
   */
  public destroy(): void {}
}