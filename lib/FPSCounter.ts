/// <reference path="lib.d.ts"/>

class FPSCounter extends TextField {
  frames: number = 0;
  timeElapsed: number = 0;

  constructor() {
    super("FPS: ???");
  }

  update(): void {
    const now = +new Date;

    this.frames += 1;

    this.x = Globals.camera.x;
    this.y = Globals.camera.y;

    if (now - this.timeElapsed > 1000) {
      this.text = `FPS: ${this.frames}
Objects: ${Sprites.all().length()}`;

      this.timeElapsed = now
      this.frames = 0;
    }
  }
}
