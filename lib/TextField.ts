class TextField extends Sprite {
  private _textField: PIXI.MultiStyleText;

  /**
   * Sets the text of this textfield. Note that this textfield has the special property
   * that you can color parts of it. For example, if you set the text to be:
   * 
   * "Hello [world!](red) [Goodbye world.](blue)"
   * 
   * Then "world!" would be in red and "Goodbye world." would be in blue. (The syntax is 
   * inspired by Markdown.)
   * 
   * If you want to use a literal [, ], ( or ), double it: "This is a bracket: [[."
   * 
   * @param val 
   * @returns {} 
   */
  public set text(val: string) {
    // TODO: I am thinking of a more versatile (and easier to code!) approach - something
    // like this: text`blah blah ${{ fill: red, font: "comic sans" }}${ "blah blah " }`.
    // 
    // It could almost be typed!
    // 
    // Or even better?
    //
    // text`bla blah ${{ fill: red, font: "comic sans", text:  "this is a test!" }}`;
    //

    enum State {
      Normal,
      AccumulatingText,
      AccumulatingColor
    };

    interface TextPiece {
      text: string;
      color?: string;
    }

    let currentState = State.Normal;

    let text = "";
    let currentColoredText = "";
    let currentColor = "";
    let i = 0;

    const char    = () => val[i];
    const next    = () => i + 1 < val.length ? val[i + 1] : "";
    const advance = (n = 1) => i += n;

    /**
     * (text, color)
     */
    const coloredText: TextPiece[] = [];

    while (i < val.length) {
      switch (currentState) {
        case State.Normal:
          if (char() == "]" && next() == "]") {
            advance(2);
            text += "]";
            break;
          }

          if (char() == "[") {
            currentState = State.AccumulatingText;
            advance(1);

            coloredText.push({ text });
            text = "";
            break;
          }

          text += char();
          advance(1);
          break;
        case State.AccumulatingText:
          if (char() == "]" && next() == "(") {
            advance(2)
            currentState = State.AccumulatingColor;
            break;
          }

          if (char() == "]" && next() == "]") {
            advance(2);
            currentColoredText += "]";
            break;
          }

          currentColoredText += char();
          advance(1);
          break;
        case State.AccumulatingColor:
          if (char() == ")" && next() == ")") {
            advance(2);
            currentColor += ")";
            break;
          }

          if (char() == ")") {
            currentState = State.Normal;
            advance(1);

            coloredText.push({ text: currentColoredText, color: currentColor });
            currentColoredText = currentColor = "";
            break;
          }

          currentColor += char();
          advance(1);
          break;
      }
    }

    let assembledText: string = text; // anything left over
    let styleRules: { [key: string]: PIXI.TextStyle } = {}
    let j = 0; 

    for (const chunk of coloredText) {
      if (chunk.color) {
        const uid = `rule${ j++ }`;

        assembledText += `<${ uid }>${ chunk.text }</${ uid }>`
        styleRules[uid] = { fill: chunk.color };
      } else {
        assembledText += chunk.text;
      }
    }

    this._textField.setTextStyles(styleRules);
    this._textField.text = assembledText;
  }

  public get text(): string {
    return this._textField.text;
  }

  constructor(content: string = "<no content dur>") {
    super();

    /*
    this._textField = new PIXI.MultiStyleText("<one>Testing!</one> normal <two>woo</two>", {
      def: { font: "12px Verdana" },
      one: { font: "12px Verdana", fill: "red" },
      two: { font: "12px Verdana", fill: "red" }
    });
    */

    this._textField = new PIXI.MultiStyleText("", {
      def: { font: "12px Verdana", fill: "white" },
    });

    this.text = content;

    this.displayObject.addChild(this._textField);
  }

  public setDefaultTextStyle(style: PIXI.TextStyle): this {
    this._textField.setStyle(style);

    return this;
  }
}