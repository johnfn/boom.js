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

    // TODO(confusing)
    // I don't understand why I have to do this. According to the PIXI docs, I shouldn't,
    // but if I remove this line, click events stop working!
    this.displayObject.hitArea = new PIXI.Rectangle(-100000, -100000, 200000, 200000);

    this.displayObject.interactive = true;
  }
}
