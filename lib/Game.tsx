class Game {
  private _width: number;
  get width(): number { return this._width; }

  private _height: number;
  get height(): number { return this._height; }

  private root: React.Component<any, {}>;
  private debug: Debug;
  private _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

  public stage: Stage;

  constructor(width: number, height: number, element: HTMLElement, debug: boolean = false) {
    this._width = width;
    this._height = height;

    this._renderer = PIXI.autoDetectRenderer(width, height);

    this.stage = new Stage(width, height, debug);
    Globals.initialize(this.stage);

    this.debug = new Debug();
    this.root = React.render(<Root stage={ this.stage } debug={ debug } />, element);
    
    this.stage.setRoot(this.root as any);

    const canvasContainer = React.findDOMNode(this.root).getElementsByClassName("content").item(0) as HTMLElement;
    canvasContainer.appendChild(this._renderer.view)

    this.stage.events.on(SpriteEvents.AddChild, () => this.onAddChild());

    // Kick off the main game loop.
    requestAnimationFrame(() => this.update());
  }

  /**
   * The core update loop.
  */
  update(): void {
    const children = this.stage.children
    children.push(this.stage)

    Globals.keyboard.update();

    for (const sprite of children) {
      for (const c of sprite.components) {
        c.preUpdate();
      }
    }

    for (const sprite of children) {
      sprite.update();

      for (const c of sprite.components) {
        c.update();
      }
    }

    for (const sprite of children) {
      for (const c of sprite.components) {
        c.postUpdate();
      }
    }

    Globals.physicsManager.update();

    this._renderer.render(this.stage.displayObject); 

    for (const sprite of Globals._destroyList) {
      for (const c of sprite.components) {
        c.destroy();
      }

      Sprites.remove(sprite);
      sprite.actuallyDestroy();
    }

    Globals._destroyList = [];

    requestAnimationFrame(this.update.bind(this));
  }

  onAddChild(): void {
    setTimeout(() => this.root.forceUpdate(), 0);
  }
}

function inspect<T extends Sprite>(target: T, name: string) {
  target.addInspectableProperty(Util.GetClassName(target), name);
}
