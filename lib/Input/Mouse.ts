enum MouseEvents {
  MouseDown
}

class Mouse {
  /**
   * The current position of the mouse.
   */
  public position: Point;

  /**
   * Is the mouse down right now?
   */
  public down: boolean;

  /**
   * Mouse events.
   * @type {Events<MouseEvents>}
   */
  public events: Events<MouseEvents>;

  constructor(stage: Stage) {
    this.position = new Point(0, 0);
    this.events   = new Events<MouseEvents>();

    stage.displayObject.on('mousemove', (e: any) => this._mousemove(e))
    stage.displayObject.on('mouseup',   (e: any) => this._mouseup(e))
    stage.displayObject.on('mousedown', (e: any) => this._mousedown(e))
  }

  private _mousemove(e: PIXI.interaction.InteractionEvent): void {
    this.position.x = e.data.global.x;
    this.position.y = e.data.global.y;
  }

  private _mousedown(e: PIXI.interaction.InteractionEvent): void {
    this.down = true;

    this.events.emit(MouseEvents.MouseDown, new Point(e.data.global.x, e.data.global.y));
  }

  private _mouseup(e: any): void {
    this.down = false;
  }
}