/**
 * An object made up of components.
 *
 * Note: Composite currently doesn't handle component inheritance...
 */
class Composite {
  public static componentsForClasses: {[className: string] : Component<Sprite>[]} = {};

  /**
   * Mapping of class names to inspectable properties of that class.
   *
   * TODO: Should probably make a whole property type so that this seems less
   * odd.
   */
  public static inspectableProperties: { [key: string]: string[]; } = {};

  private _components: Component<Sprite>[];

  constructor() {
    this._components = Composite.componentsForClasses[Util.GetClassName(this)] || [];
  }
}