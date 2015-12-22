/**
 * Main Game object.
 *
 * Put everything that needs to be loaded in the constructor. When loading is finished,
 * loadingComplete() will be called.
 *
 */
class Game {
  public static ticks  : number = 0;

  /**
   * Turns on a bunch of debugging-only features.
   */
  public static DEBUG_MODE: boolean = false;

  public stage            : Stage;

  /**
   *  A convenient place to attach things so they don't move when the camera does.
   */
  public fixedStage: Sprite;

  private root         : React.Component<any, {}>;
  private _renderer    : PIXI.WebGLRenderer | PIXI.CanvasRenderer;

  private _width: number;
  get width(): number { return this._width; }

  private _height: number;
  get height(): number { return this._height; }

  constructor(width: number, height: number, element: HTMLElement, backgroundColor = 0x000000, debugging = false) {
    this._width     = width;
    this._height    = height;
    this._renderer  = PIXI.autoDetectRenderer(width, height, { backgroundColor });

    this.fixedStage = new Sprite();
    this.stage      = new Stage(width, height);

    Globals.initialize(this.stage, this.fixedStage);

    this.root       = React.render(<Root stage={ this.stage } />, element);

    const canvasContainer = React.findDOMNode(this.root).getElementsByClassName('content').item(0) as HTMLElement;
    canvasContainer.appendChild(this._renderer.view)

    this.stage.events.on(SpriteEvents.AddChild, () => this._onAddChild());

    this.fixedStage.addChild(this.stage);

    Globals.events.on(GlobalEvents.LoadingIsDone, () => this.loadingComplete());
  }

  public static EveryNthFrame(n: number): boolean {
    return Game.ticks % n === 0;
  }

  protected loadingComplete(): void {
    // Kick off the main game loop.
    requestAnimationFrame(() => this.update());
  }

  /**
   * The core update loop.
   */
  public update(): void {
    let composites = Composites.all().items();

    Game.ticks++;

    Globals.keyboard.update();

    for (const composite of composites) {
      composite.preUpdate();

      for (const c of composite.getComponents()) {
        c.preUpdate();
      }
    }

    for (const composite of composites) {
      composite.update();

      for (const c of composite.getComponents()) {
        c.update();
      }
    }

    Globals.physicsManager.update();

    for (const composite of composites) {
      composite.postUpdate();

      for (const c of composite.getComponents()) {
        c.postUpdate();
      }
    }

    for (const sprite of Globals._destroyList) {
      for (const c of sprite.getComponents()) {
        c.destroy();
      }

      Composites.remove(sprite);
      sprite._actuallyDestroy();
    }

    Globals._destroyList = [];

    Globals.camera.update();

    this._renderer.render(this.fixedStage.displayObject);

    requestAnimationFrame(this.update.bind(this));
  }

  private _onAddChild(): void {
    setTimeout(() => this.root.forceUpdate(), 0);
  }
}

function inspect<T extends Sprite>(target: T, name: string): void {
  target.addInspectableProperty(Util.GetClassName(target), name);
}
