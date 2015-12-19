class TransformWidget extends Sprite {
  private _downArrow: Polygon;
  private _rightArrow: Polygon;
  private _target: Sprite;

  constructor() {
    super();

    this.displayObject.interactive = true;

    this.draw();

    this.events.on(SpriteEvents.ChangeParent, (parent: Sprite) => {
      this._target = parent;
    })

    this.debug.events.on(SpriteEvents.MouseDown, (point: PIXI.Point) => {
      if (this._downArrow.contains(point)) {
        this._target.y += 10;
      }

      if (this._rightArrow.contains(point)) {
        this._target.x += 10;
      }
    });

    this.debug.events.on(SpriteEvents.MouseUp, () => {
      console.log("goodbye");
    });
  }

  private draw() {
    this._downArrow = new Polygon([
      new Point(-10, 50),
      new Point(10, 50),
      new Point(0, 70)
    ]);

    this._rightArrow = new Polygon([
      new Point(50, -10),
      new Point(50, 10),
      new Point(70, 0)
    ]);

    this.debug.drawLine(0, 0, 0, 50, 0xffffff, 1);
    this.debug.drawLine(0, 0, 50, 0, 0xffffff, 1);

    this.debug.drawShape(this._downArrow, Color.Red);

    this.debug.drawShape(this._rightArrow, Color.Red);
  }
}