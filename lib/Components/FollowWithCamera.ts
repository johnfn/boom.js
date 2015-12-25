/// <reference path="../Component.ts"/>

/**
 * Follow the target with the camera.
 *
 * Could eventually build better camera behaviors etc.
 */
class FollowWithCamera extends Component<Sprite> {
  public update(): void {}

  public postUpdate(): void {
    Globals.camera.x = this._composite.x - Globals.camera.width / 2;
    Globals.camera.y = this._composite.y - Globals.camera.height / 2;
  }
}
