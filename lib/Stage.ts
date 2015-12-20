﻿class Stage extends Sprite {
  public baseName: string = "Stage";
  public root    : Root;

  private _width : number;
  private _height: number;

  /**
    Maps DisplayObjects to Sprites associated to those DisplayObjects.
  */
  public static doToSprite = new MagicDict<PIXI.DisplayObject, Sprite>();

  /**
   * The width of the Stage. (readonly)
   */
  get width(): number { return this._width; }
  set width(val: number) { this._width = val; }

  /**
   * The height of the Stage. (readonly)
   */
  get height(): number { return this._height; }
  set height(val: number) { this._height = val; }

  /**
   * Stage is the Sprite at the top of the display hierarchy.
   */
  constructor(width: number, height: number) {
    super();

    this.width  = width;
    this.height = height;

    this.displayObject.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.displayObject.interactive = true;

    this.events.on(SpriteEvents.MouseDown, (e: PIXI.interaction.InteractionEvent) => this.mousedown(e));
  }

  setRoot(root: Root) {
    this.root = root;
  }

  findSpritesAt(point: Point): Sprite[] {
    var sprites = this.getAllSprites();

    return sprites.filter(o => {
      return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
             point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
    });
  }

  private mousedown(e: PIXI.interaction.InteractionEvent): void {
    let point  = new Point(e.data.global.x, e.data.global.y);
    let target = this.findTopmostSpriteAt(point, true);

    this.root.setTarget(target);
  }

  public removeChild(sprite: Sprite) {
    this.displayObject.removeChild(sprite.displayObject);
  }
}
