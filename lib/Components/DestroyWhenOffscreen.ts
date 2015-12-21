/// <reference path="../Component.ts"/>

class DestroyWhenOffscreen extends Component<Sprite> {
  public update(): void {
    const stage = Globals.stage;

    if (this._composite.x < 0 || this._composite.x > stage.width ||
        this._composite.y < 0 || this._composite.y > stage.height) {

      this._composite.destroy();
    }
  }
}