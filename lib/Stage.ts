class Stage extends Sprite {
  public baseName: string = 'Stage';

  private _width : number;
  private _height: number;

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
}
