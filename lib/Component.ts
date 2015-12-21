abstract class Component<T extends Composite> {
  protected _composite: T;

  /**
   * Called when we are creating the component. The Composite is not guaranteed
   * to be fully initialized yet.
   */
  constructor() { }

  /**
   * Put component initialization logic here. Called once the Composite is
   * fully initialized.
   */
  public init(): void { }

  public setTarget(composite: T): void {
    this._composite = composite;
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