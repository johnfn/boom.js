/// <reference path="./Evented.ts"/>

enum DebugEvents {
  MouseDown,
  MouseUp,
  MouseMove
}

interface HasDebugDraw { debug: DebugDraw }

/**
 * A handy component for drawing debugging shapes (lines, rectangles)
 * on Sprites.
 *
 * DebugDraw will clear itself right before you start drawing on it for
 * the first time in a particular frame. This is meant to allow two different
 * use cases:
 *
 * 1) calling draw() from the update() function of a sprite.
 * 2) calling draw() from an event that triggers occasionally.
 *
 * The idea is that DebugDraw will clear when you expect it to clear.
 */
class DebugDraw extends Component<Sprite & HasDebugDraw> {
  public events: Events<DebugEvents> = new Events<DebugEvents>(true);

  private _graphics: PIXI.Graphics;
  private _clickableShapes   = new MagicArray<Polygon>();
  private _hasDrawnThisFrame = false;

  constructor() {
    super('debug')
  }

  public init(): void {
    super.init();

    this._graphics = new PIXI.Graphics();
    this._composite._addDO(this._graphics);
    this._composite.displayObject.interactive = true;
    this._graphics.interactive = true;

    this._composite.debug = this;

    /* Add mouse events, but listen to MetaEvents.AddFirstEvent so we
       aren't adding interactive events when there's no need to. */

    this.events.metaEvents.on(MetaEvents.AddFirstEvent, () => {
      const dObj = this._composite.displayObject;

      dObj.interactive = true;
      dObj.hitArea = new PIXI.Rectangle(-50, -50, 200, 200);

      dObj.on('mousedown', (e: PIXI.interaction.InteractionEvent) => {
        let pos = e.data.getLocalPosition(dObj, e.data.global.clone());

        if (this._areCoordsInBounds(pos)) {
          this.events.emit(DebugEvents.MouseDown, pos);

          e.stopPropagation();
        }
      });

      dObj.on('mouseup', (e: PIXI.interaction.InteractionEvent) => {
        let pos = e.data.getLocalPosition(dObj, e.data.global.clone());

        this.events.emit(DebugEvents.MouseUp, pos);

        e.stopPropagation();
      });

      dObj.on('mousemove', (e: PIXI.interaction.InteractionEvent) => {
        let pos = e.data.getLocalPosition(dObj, e.data.global.clone());

        this.events.emit(DebugEvents.MouseMove, pos);

        e.stopPropagation();
      })
    });
  }

  public draw(item: Ray | PIXI.Point | Point | Polygon | PIXI.Rectangle | Sprite, color = 0xff0000, alpha = 1): void {
    if (!this._hasDrawnThisFrame) {
      this._hasDrawnThisFrame = true;

      this.clear();
    }

    if (item instanceof Ray) {
      this._drawLine(item.x0, item.y0, item.x1, item.y1, color, alpha)
    } else if (item instanceof Point) {
      this._drawPoint(item.x, item.y, color);
    } else if (item instanceof PIXI.Point) {
      this._drawPoint(item.x, item.y, color);
    } else if (item instanceof Polygon) {
      this._drawShape(item, color);
    } else if (item instanceof PIXI.Rectangle) {
      this.drawRectangle(item.x, item.y, item.x + item.width, item.y + item.height);
    } else if (item instanceof Sprite) {
      this.drawRectangle(item.x, item.y, item.x + item.width, item.y + item.height);
    } else {
      debugger;

      console.error("I don't know how to draw that shape.")
    }
  }

  /**
   * Removes everything on the graphics object. Meant for debugging purposes only.
   */
  public clear(): void {
    this._graphics.clear();
  }

  public preUpdate(): void {
    this._hasDrawnThisFrame = false;
  }

  public postUpdate(): void {

  }

  public update(): void { }

  private _areCoordsInBounds(point: PIXI.Point): boolean {
    for (const polygon of this._clickableShapes) {
      if (polygon.contains(point)) {
        return true;
      }
    }

    return false;
  }

  private _drawLine(x0: number, y0: number, x1: number, y1: number, color = 0xffffff, alpha = 1, double = false): void {
    this._graphics.lineStyle(1, color, alpha);

    this._graphics.moveTo(x0, y0);
    this._graphics.lineTo(x1, y1);

    if (double) {
      this._graphics.lineStyle(1, 0x000000, alpha);

      if (y0 !== y1) {
        this._graphics.moveTo(x0 - 1, y0);
        this._graphics.lineTo(x1 - 1, y1);

        this._graphics.moveTo(x0 + 1, y0);
        this._graphics.lineTo(x1 + 1, y1);
      } else {
        this._graphics.moveTo(x0, y0 - 1);
        this._graphics.lineTo(x1, y1 - 1);

        this._graphics.moveTo(x0, y0 + 1);
        this._graphics.lineTo(x1, y1 + 1);
      }
    }
  }

  private _drawPoint(x: number, y: number, color = 0xff0000): void {
    this._drawLine(x, 0, x, Globals.stage.height, color);
    this._drawLine(0, y, Globals.stage.width, y, color);
  }

  private _drawShape(polygon: Polygon, color = 0xffffff): void {
    let lastPoint = polygon.points[polygon.points.length - 1];

    this._graphics.lineStyle(0, 0x000000, 0);

    this._graphics.beginFill(color);
    this._graphics.lineColor = 0;

    this._graphics.moveTo(lastPoint.x, lastPoint.y);

    for (const point of polygon.points) {
      this._graphics.lineTo(point.x, point.y);
    }

    this._graphics.endFill();

    this._clickableShapes.push(polygon);
  }

  private drawRectangle(x0: number, y0: number, x1: number, y1: number): void {
    let white = 0xffffff;
    let alpha = 1;

    const camera = Globals.camera;

    /*
          (1)        (2)
          x0         x1
          |          |
          |          |
          |          |
   y0-----*----------*-------  (3)
          |          |
          |          |
          |          |
   y1-----*----------*-------  (4)
          |          |
          |          |
          |          |

    */

    // (1)

    this._drawLine(x0, camera.y, x0, camera.y + camera.height, white, alpha);
    this._drawLine(x0, y0, x0, y1, white, alpha, true);

    // (2)

    this._drawLine(x1, camera.y, x1, camera.y + camera.height, white, alpha);
    this._drawLine(x1, y0, x1, y1, white, alpha, true);

    // (3)

    this._drawLine(camera.x, y0, camera.x + camera.width, y0, white, alpha);
    this._drawLine(x0, y0, x1, y0, white, alpha, true);

    // (4)

    this._drawLine(camera.x, y1, camera.x + camera.width, y1, white, alpha);
    this._drawLine(x0, y1, x1, y1, white, alpha, true);
  }
}