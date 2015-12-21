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

  public update(): void { }

  public postUpdate(): void { };

  /**
   * Override to implement cleanup logic when the sprite with this component
   * gets destroyed.
   */
  public destroy(): void {}
}