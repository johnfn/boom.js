/// <reference path="lib.d.ts"/>

@component(new FixedToCamera(200, 100))
class FPSCounter extends TextField {
  private _frames: number = 0;
  private _timeElapsed: number = 0;

  constructor() {
    super('FPS: ???');

    this.z = 50;
  }

  public update(): void {
    const now = +new Date;

    this._frames += 1;

    if (now - this._timeElapsed > 1000) {
      this.text = `<one>FPS: ${ this._frames }
Objects: ${ Composites.all().length() }</one>`;

      this._timeElapsed = now
      this._frames = 0;
    }
  }
}
