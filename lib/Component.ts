import { Composite } from './Core.ts'
export abstract class Component<T extends Composite> {
  /**
   * The composite that this component belongs to.
   */
  protected _composite: T;

  /**
   * The property name on the composite that refers to this component, if there is one.
   */
  private _propName: string;

  /**
   * Called when we are creating the component. The Composite is not guaranteed
   * to be fully initialized yet.
   */
  constructor(propName = '') {
    this._propName = propName;
  }

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

  public getComposite(): T {
    return this._composite;
  }

  public getPropName(): string {
    return this._propName;
  }
}