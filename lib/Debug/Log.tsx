declare var consoleCache: LogItemState[];
declare var sourceMaps: { [key: string]: sourceMap.RawSourceMap };

// Object[] should really be Loggable[] - but Typescript doesn't currently
// allow recursive types.
type Loggable = string
  | number
  | Sprite
  | Object[]
  | Sprite
  | PIXI.Rectangle
  | PIXI.Point
  | PIXI.Texture;

enum LogItemType {
  Normal,
  Error
}

class LogProps {
  stage: Stage;
  debugLayer: DebugLayer;
  root: Root;
}

interface LogItemState {
  content: Loggable[];
  metadata: string; // function who called, line number, etc.
  logItemType: LogItemType;
  count: number;
}

class LogState {
  public contents: LogItemState[];
}

class DebugLayer {
  private _layers: MagicDict<string, Sprite>;
  private _stage: Stage;
  private _container: Sprite;

  constructor(stage: Stage) {
    this._layers = new MagicDict<string, Sprite>();
    this._stage = stage;

    this._stage.addChild(this._container = new Sprite());

    this._container.baseName = "Debug";
    this._container.z = Number.POSITIVE_INFINITY; // force debugging info to top of screen
  }

  private getLayerForComponent<T, U>(identifier: string) {
    let result: Sprite;

    if (!this._layers.contains(identifier)) {
      result = this._container.addChild(this._layers.put(identifier, new Sprite()));

      result.baseName = identifier;
    } else {
      result = this._layers.get(identifier);
    }

    return result;
  }

  drawPoint<T, U>(x: number, y: number, identifier: string) {
    let layer = this.getLayerForComponent(identifier);

    layer.debug.draw(new Point(x, y));
  }

  drawRect<T, U>(rect: PIXI.Rectangle, identifier: string) {
    let layer = this.getLayerForComponent(identifier);

    layer.debug.draw(rect);
  }

  drawSprite<T, U>(sprite: Sprite, identifier: string) {
    let layer = this.getLayerForComponent(identifier);

    layer.debug.draw(sprite.bounds);
  }

  clear<T, U>(identifier: string) {
    let layer = this.getLayerForComponent(identifier);

    if (!layer) {
      // TODO - could use fancy console logging here for sprites... IF I HAD IT
      console.error("Um, that layer doesn't exist...");
      return;
    }

    layer.debug.clear();
  }
}

class Log extends React.Component<LogProps, LogState> {
  constructor(props: LogProps) {
    super(props);

    this.state = { contents: consoleCache };

    this.overrideConsoleLog();
  }

  overrideConsoleLog() {
    // setTimeout is necessary so we don't call setState within a render function - we want to
    // be able to console.log from anywhere.

    console.log = (...s: any[]) => {
      let caller = this.getCallingFunction();

      setTimeout(() => this.log(caller, s));
    };

    console.error = (...s: any[]) => {
      let caller = this.getCallingFunction();

      setTimeout(() => this.error(caller, s));
    };
  }

  // GetCallingFunction
  //
  // Will get the function that called the function that you call GetCallingFunction() inside.
  // Only tested on IE.
  //
  // For example:
  //
  // foo() {
  //   console.log(GetCallingFunction()); // bar
  // }
  //
  // bar () {
  //   foo();
  // }

  // The stacktrace provided by e.stack looks like this:

  // [0]: "Error: myError"
  // [1]: "   at Util.StackTrace (http://localhost:58550/main.js?0.6854253500429788:106:13)"
  // [2]: "   at eval code (eval code:1:1)"
  // [3]: "   at Log.log (http://localhost:58550/main.js?0.6854253500429788:158:13)"
  // [4]: "   at callingFunction (http://localhost:58550/main.js?0.6854253500429788:384:9)"
  // [5]: "   at Anonymous function (http://localhost:58550/main.js?0.6854253500429788:390:31)"

  getCallingFunction() {
    let error: Error;

    // First try catch is because I need a stack object from an error.
    try {
      throw new Error('myError');
    } catch (e) {
      error = e;
    }

    // Second try catch is because I'm lazy and this code doesn't work on Chrome (TODO)
    try {
      let trace = (error as any).stack;
      let lineOfCaller = trace.split("\n")[3];

      // TODO: This regex does not handle anonymous functions in Chrome very well.
      let parts: string[] = lineOfCaller.match(/ at (([\w<>\.]+) |Anonymous function |Global code |.{0})\(https?:\/\/\w+:?\d{0,5}\/(\w+\.js)[^:]+\:(\d+)\:(\d+)\)/);

      // matches [, function name, , file name, line, column]

      let functionName = parts[1].replace(".prototype.", "#");
      let fileName = parts[3];
      let line = parseInt(parts[4]);
      let column = parseInt(parts[5]);

      // TODO: turn TiledMapParser.prototype.process into TiledMapParser#process

      if (!sourceMaps[fileName]) {
        // It's dang near impossible to procede from this point, since waiting on source
        // maps to load would be an asynchronous process that would clobber the stack trace.
        return "[source maps not loaded]";
      }

      // There is some other Position object from lib.d.ts clobbering source-map's Position,
      // hence the any cast.
      let original = new sourceMap.SourceMapConsumer(sourceMaps[parts[3]])
        .originalPositionFor({ line, column } as any);
      let originalFile: string;
      try {
        originalFile = original.source.split("/")[original.source.split("/").length - 1];
      } catch (e) {
        originalFile = `<unknown>`;
      }

      return `${original.name} (${originalFile}:${original.line})`
    } catch (e) {
      return `Don't use chrome lol`;
    }
  }

  public log(caller: string, content: Loggable[]) {
    this.logHelper(caller, content, LogItemType.Normal);
  }

  public error(caller: string, content: Loggable[]) {
    this.logHelper(caller, content, LogItemType.Error);
  }

  private logHelper(metadata: string, content: Loggable[], logItemType: LogItemType) {
    this.setState((prev: LogState) => {
      let last = prev.contents[prev.contents.length - 1];

      if (Util.ArrayEq(last.content, content)) {
        last.count++;
      } else {
        prev.contents.push({ content, metadata, logItemType, count: 1 });
      }

      return prev;
    });
  }

  shouldScrollBottom: boolean;

  componentWillUpdate() {
    var node = React.findDOMNode(this);

    this.shouldScrollBottom = node.scrollTop + (node as any).offsetHeight >= node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      var node = React.findDOMNode(this);
      node.scrollTop = node.scrollHeight
    }
  }

  public static loggableToHTML(content: Loggable, debugLayer: DebugLayer, root: Root): JSX.Element {
    if (typeof content === "string") {
      return <LogItemString content={ content } />;
    } else if (typeof content === "number") {
      return <span> { content.toString() } </span>;
    } else if (content instanceof Array) {
      var items = content.map(o => Log.loggableToHTML(o as Loggable, debugLayer, root));

      return <span> [{ items }] </span>
    } else if (content instanceof PIXI.Rectangle) {
      return <LogItemRect rect={ content } debug={ debugLayer } />;
    } else if (content instanceof PIXI.Point) {
      return <LogItemPoint point={ content.clone() } debugLayer={ debugLayer } />;
    } else if (content instanceof PIXI.Texture) {
      return <LogItemTexture texture={ content } debugLayer={ debugLayer } />;
    } else if (content instanceof Sprite) {
      return <LogItemSprite sprite={ content } root={ root } debugLayer={ debugLayer } />;
    } else if (typeof content === "object") {
      // Note - this check should definitely come last.

      return <LogItemObject object={ content } debugLayer={ debugLayer } root={ root } />;
    }

    return <span>???????{ content } </span>
  }

  render() {
    var logContent = this.state.contents.map((item: LogItemState, index: number) =>
      <div
        key={ index }
        className="log-entry">
        <span className="number less-important">{ index } </span>
        <span className={ item.logItemType == LogItemType.Normal ? "log-normal" : "log-error" }>
          { item.content.map(content => Log.loggableToHTML(content, this.props.debugLayer, this.props.root)) }
          <span className="count">
            { item.count > 1 ? `(${item.count})` : `` }
          </span>
        </span>
        <span className="log-from">
          <span className="less-important"> from </span>
          { item.metadata }
        </span>
      </div>
    );

    return <div className="log">
      <div className="log-title">Log</div>

      { logContent }
    </div>;
  }
}

