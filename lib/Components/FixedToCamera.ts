﻿/// <reference path="../Component.ts"/>

class FixedToCamera extends Component<Sprite> {
  private _x: number;

  private _y: number;

  constructor(x: number, y: number) {
    super();

    this._x = x;
    this._y = y;
  }

  public init(sprite: Sprite): void {
    super.init(sprite);

    Globals.fixedStage.addChild(sprite.moveTo(this._x, this._y));
  }

  public update(): void { }
}
