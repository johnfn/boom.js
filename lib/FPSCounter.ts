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

    if (now - this.timeElapsed > 1000) {
      this.text = `FPS: ${this.frames}`;

      this.timeElapsed = now
      this.frames = 0;
    }
  }
}
