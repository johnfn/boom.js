
class TransformWidget extends Sprite {
  private _downArrow: Polygon;
  private _rightArrow: Polygon;
  private _target: Sprite;

  private _downHighlighted: boolean = false;
  private _rightHighlighted: boolean = false;

  private _moveToTarget = () => {
    this.x = this._target.globalX + this._target.width / 2;
    this.y = this._target.globalY + this._target.height / 2;
  }

  constructor() {
    super();

    this.displayObject.interactive = true;

    this.z = Number.POSITIVE_INFINITY;
  }

  public init(): void {
    super.init();

    this._draw();

    this.debug.events.on(DebugEvents.MouseMove, (point: PIXI.Point) => {
      const newdh  = this._downArrow.contains(point);
      const newrh  = this._rightArrow.contains(point);
      const change = (newdh !== this._downHighlighted) || (newrh !== this._rightHighlighted);

      this._downHighlighted  = newdh;
      this._rightHighlighted = newrh;

      if (change) { this._draw(); }
    });

    this.debug.events.on(DebugEvents.MouseDown, (point: PIXI.Point) => {
      if (this._downArrow.contains(point)) {
        this._target.y += 10;
      }

      if (this._rightArrow.contains(point)) {
        this._target.x += 10;
      }
    });
  }

  public setTarget(target: Sprite): void {
    if (this._target) {
      this._target.events.off(SpriteEvents.Move, this._moveToTarget);
    }

    this._target = target;

    this._target.events.on(SpriteEvents.Move, this._moveToTarget);

    this._moveToTarget();
  }

  private _draw(): void {
    this._downArrow = new Polygon([
      new Point(-10, 50),
      new Point(10, 50),
      new Point(0, 70),
    ]);

    this._rightArrow = new Polygon([
      new Point(50, -10),
      new Point(50, 10),
      new Point(70, 0),
    ]);

    const ray1 = new Ray(0, 0, 0, 50);
    const ray2 = new Ray(0, 0, 50, 0);

    this.debug.draw(ray1, 0xffffff, 1);
    this.debug.draw(ray2, 0xffffff, 1);

    this.debug.draw(this._downArrow, this._downHighlighted ? Color.WHITE : Color.RED);
    this.debug.draw(this._rightArrow, this._rightHighlighted ? Color.WHITE : Color.RED);
  }
}