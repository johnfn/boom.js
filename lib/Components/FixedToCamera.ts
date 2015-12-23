/// <reference path="../Component.ts"/>

class FixedToCamera extends Component<Sprite> {
  private _x: number;

  private _y: number;

  constructor(x: number, y: number) {
    super();

    this._x = x;
    this._y = y;
  }

  public init(): void {
    super.init();

    Globals.fixedStage.addChild(this._composite.moveTo(this._x, this._y));
  }

  public update(): void { }
}
