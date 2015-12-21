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

interface LogProps {
  stage: Stage;
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

class Log extends React.Component<LogProps, LogState> {
  private _debugSprite: Sprite;

  private _shouldScrollBottom: boolean;

  constructor(props: LogProps) {
    super(props);

    this.state = { contents: consoleCache };

    this._debugSprite = new DebugSprite().addTo(this.props.stage);

    this._overrideConsoleLog();
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

  private _getCallingFunction() {
    let error: Error;

    // First try catch is because I need a stack object from an error.
    try {
      throw new Error('myError');
    } catch (e) {
      error = e;
    }

    // Second try catch is because I'm lazy and this code doesn't work on Chrome (TODO)
    try {
      const trace = (error as any).stack;
      const lineOfCaller = trace.split('\n')[3];

      // TODO: This regex does not handle anonymous functions in Chrome very well.
      const parts: string[] = lineOfCaller.match(/ at (([\w<>\.]+) |Anonymous function |Global code |.{0})\(https?:\/\/\w+:?\d{0,5}\/(\w+\.js)[^:]+\:(\d+)\:(\d+)\)/);

      // matches [, function name, , file name, line, column]

      // let functionName = parts[1].replace('.prototype.', '#');
      const fileName = parts[3];
      const line = parseInt(parts[4], 10);
      const column = parseInt(parts[5], 10);

      // TODO: turn TiledMapParser.prototype.process into TiledMapParser#process

      if (!sourceMaps[fileName]) {
        // It's dang near impossible to procede from this point, since waiting on source
        // maps to load would be an asynchronous process that would clobber the stack trace.
        return '[source maps not loaded]';
      }

      // There is some other Position object from lib.d.ts clobbering source-map's Position,
      // hence the any cast.
      const original = new sourceMap.SourceMapConsumer(sourceMaps[parts[3]])
        .originalPositionFor({ line, column } as any);
      let originalFile: string;
      try {
        originalFile = original.source.split('/')[original.source.split('/').length - 1];
      } catch (e) {
        originalFile = `<unknown>`;
      }

      return `${original.name} (${originalFile}:${original.line})`
    } catch (e) {
      return `Don't use chrome lol`;
    }
  }

  public log(caller: string, content: Loggable[]): void {
    this._logHelper(caller, content, LogItemType.Normal);
  }

  public error(caller: string, content: Loggable[]): void {
    this._logHelper(caller, content, LogItemType.Error);
  }

  public componentWillUpdate(): void {
    const node = React.findDOMNode(this);

    this._shouldScrollBottom = node.scrollTop + (node as any).offsetHeight >= node.scrollHeight;
  }

  public componentDidUpdate(): void {
    if (this._shouldScrollBottom) {
      const node = React.findDOMNode(this);
      node.scrollTop = node.scrollHeight
    }
  }

  public loggableToHTML(content: Loggable): JSX.Element {
    if (typeof content === 'string') {
      return <LogItemString content={ content } />;
    } else if (typeof content === 'number') {
      return <span> { content.toString() } </span>;
    } else if (content instanceof Array) {
      const items = content.map(o => this.loggableToHTML(o as Loggable));

      return <span> [{ items }] </span>
    } else if (content instanceof PIXI.Rectangle) {
      return <LogItemRect rect={ content } debugSprite={ this._debugSprite } />;
    } else if (content instanceof PIXI.Point) {
      return <LogItemPoint point={ content.clone() } debugSprite={ this._debugSprite } />;
    } else if (content instanceof PIXI.Texture) {
      return <LogItemTexture texture={ content } />;
    } else if (content instanceof Sprite) {
      return <LogItemSprite sprite={ content } root={ this.props.root } debugSprite={ this._debugSprite } />;
    } else if (typeof content === 'object') {
      // Note - this check should definitely come last.

      return <LogItemObject object={ content } root={ this.props.root } />;
    }

    return <span>???????{ content } </span>
  }

  public render(): JSX.Element {
    const logContent = this.state.contents.map((item: LogItemState, index: number) =>
      <div
        key={ index }
        className='log-entry'>
        <span className='number less-important'>{ index } </span>
        <span className={ item.logItemType === LogItemType.Normal ? 'log-normal' : 'log-error' }>
          { item.content.map(content => this.loggableToHTML(content)) }
          <span className='count'>
            { item.count > 1 ? `(${item.count})` : `` }
          </span>
        </span>
        <span className='log-from'>
          <span className='less-important'> from </span>
          { item.metadata }
        </span>
      </div>
    );

    return <div className='log'>
      <div className='log-title'>Log</div>

      { logContent }
    </div>;
  }

  private _overrideConsoleLog(): void {
    // setTimeout is necessary so we don't call setState within a render function - we want to
    // be able to console.log from anywhere.

    console.log = (...s: any[]) => {
      let caller = this._getCallingFunction();

      setTimeout(() => this.log(caller, s));
    };

    console.error = (...s: any[]) => {
      let caller = this._getCallingFunction();

      setTimeout(() => this.error(caller, s));
    };
  }

  private _logHelper(metadata: string, content: Loggable[], logItemType: LogItemType) {
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
}

