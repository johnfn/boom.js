class TransformWidget extends Sprite {
  private _downArrow: Polygon;
  private _rightArrow: Polygon;
  private _dragSquare: Polygon;
  private _target: Sprite;

  private _downHighlighted   = false;
  private _rightHighlighted  = false;
  private _squareHighlighted = false;

  private get _isDragging(): boolean {
    return this._isDraggingX || this._isDraggingY;
  }

  private _isDraggingX    = false;
  private _isDraggingY    = false;
  private _dragOffset     : PIXI.Point;

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
      if (this._isDragging) {
        if (this._isDraggingX) {
          this._target.x += Globals.mouse.position.x - this.absXY.x - this._dragOffset.x;
        }

        if (this._isDraggingY) {
          this._target.y += Globals.mouse.position.y - this.absXY.y - this._dragOffset.y;
        }
      } else {
        // mouse over effects.
        const newdh  = this._downArrow.contains(point);
        const newrh  = this._rightArrow.contains(point);
        const newsh  = this._dragSquare.contains(point);
        const change = (newdh !== this._downHighlighted) || (newrh !== this._rightHighlighted) || (newsh !== this._squareHighlighted);

        this._downHighlighted   = newdh;
        this._rightHighlighted  = newrh;
        this._squareHighlighted = newsh;

        if (change) { this._draw(); }
      }
    });

    this.debug.events.on(DebugEvents.MouseDown, (point: PIXI.Point) => {
      if (this._downArrow.contains(point)) {
        this._isDraggingY = true;
      }

      if (this._rightArrow.contains(point)) {
        this._isDraggingX = true;
      }

      if (this._dragSquare.contains(point)) {
        this._isDraggingX = this._isDraggingY = true;
      }

      if (this._isDragging) {
        this._dragOffset = Globals.mouse.position.subtract(this.absXY);
      }
    });

    this.debug.events.on(DebugEvents.MouseUp, (point: PIXI.Point) => {
      this._isDraggingX = this._isDraggingY = false;
    })
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

    this._dragSquare = new Polygon([
      new Point(0, 0),
      new Point(20, 0),
      new Point(20, 20),
      new Point(0, 20),
    ]);

    const ray1 = new Ray(0, 0, 0, 50);
    const ray2 = new Ray(0, 0, 50, 0);

    this.debug.draw(ray1, 0xffffff, 1);
    this.debug.draw(ray2, 0xffffff, 1);

    this.debug.draw(this._downArrow, this._downHighlighted ? Color.WHITE : Color.RED);
    this.debug.draw(this._rightArrow, this._rightHighlighted ? Color.WHITE : Color.RED);

    this.debug.draw(this._dragSquare, this._squareHighlighted ? Color.WHITE : Color.RED);
  }
}