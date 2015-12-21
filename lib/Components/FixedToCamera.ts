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
    Globals.fixedStage.addChild(this._sprite.moveTo(this._x, this._y));
  }

  public update(): void {
    super.update();
  }
}
