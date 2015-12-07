class TextField extends Sprite {
  private _textField: PIXI.MultiStyleText;

  constructor(content: string = "") {
    super();

    this._textField = new PIXI.MultiStyleText("<one>Testing!</one> normal <two>woo</two>", {
      def: { font: "12px Verdana" },
      one: { font: "12px Verdana", fill: "red" },
      two: { font: "12px Verdana", fill: "red" }
    });

    this.displayObject.addChild(this._textField);
  }
}