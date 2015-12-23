/// <reference path="../Component.ts"/>

class InspectComponent extends Component<Sprite> {
  public static defaultInspectableProperties = ['x', 'y', 'width', 'height', 'rotation', 'alpha'];

  /**
   * Mapping of class names to inspectable properties of that class.
   *
   * TODO: Should probably make a whole property type so that this seems less
   * odd.
   */
  public static inspectableProperties: { [key: string]: string[]; } = {};

  /**
   * This just maps sprite names to number of that type of sprite that we have
   * seen. Only really used for name.
   */
  private static _derivedObjectCount: { [key: string]: number; } = {};

  /**
   * Name for this sprite. Only used for debugging.
   */
  public get name(): string { return `${Util.GetClassName(this._composite)} (${this._objectNumber})`; }

  private _baseName: string = '';

  /**
   * This is the _objectNumber-th Sprite-subclass created.
   */
  private _objectNumber: number;

  public static addInspectableProperty(className: string, propName: string): void {
    InspectComponent.inspectableProperties[className] = InspectComponent.inspectableProperties[className] || InspectComponent.defaultInspectableProperties.slice(0);
    InspectComponent.inspectableProperties[className].push(propName);
  }

  public setBaseName(name: string): void {
    this._baseName = name;
  }

  public init(): void {
    const className = Util.GetClassName(this._composite);

    this._objectNumber = InspectComponent._derivedObjectCount[className] = (InspectComponent._derivedObjectCount[className] || 0) + 1;
  }

  public update(): void { }

  public postUpdate(): void { }

  get inspectableProperties(): string[] {
    const className = Util.GetClassName(this._composite);

    InspectComponent.inspectableProperties[className] = InspectComponent.inspectableProperties[className] || InspectComponent.defaultInspectableProperties.slice(0);
    return InspectComponent.inspectableProperties[className];
  }
}

function inspect<T extends Sprite>(target: T, name: string): void {
  InspectComponent.addInspectableProperty(Util.GetClassName(target), name);
}