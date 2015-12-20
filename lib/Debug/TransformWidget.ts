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

    const ray1 = new Ray(0, 0, 0, 50);
    const ray2 = new Ray(0, 0, 50, 0);

    this.debug.draw(ray1, 0xffffff, 1);
    this.debug.draw(ray2, 0xffffff, 1);
    this.debug.draw(this._downArrow, Color.RED);
    this.debug.draw(this._rightArrow, Color.RED);
  }
}