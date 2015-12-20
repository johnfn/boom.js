class Stage extends Sprite {
  public baseName: string = "Stage";

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
  }

  findSpritesAt(point: Point): Sprite[] {
    var sprites = this.getAllSprites();

    return sprites.filter(o => {
      return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
             point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
    });
  }

  public removeChild(sprite: Sprite) {
    this.displayObject.removeChild(sprite.displayObject);
  }
}
