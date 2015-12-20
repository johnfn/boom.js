interface RootProps {
  stage: Stage;
}

interface RootState {
  target: Sprite;
}

/**
 * A sprite purely used for rendering debugging graphics.
 */
class DebugSprite extends Sprite {
  constructor() {
    super();

    this.z           = Number.POSITIVE_INFINITY;
    this.inspectable = false;
  }
}

/**
 * Root is the react component at the base of the HTML hierarchy.
 */
class Root extends React.Component<RootProps, RootState> {
  private _currentMousedObject : Sprite;
  private _currentClickedObject: Sprite;
  private _stageDebug          : Sprite;

  public transformWidget = new TransformWidget();

  constructor(props: RootProps) {
    super(props);

    const stage = props.stage;

    this.state = { target: null };

    this._stageDebug = new DebugSprite().addTo(props.stage);

    stage.events.on(SpriteEvents.MouseMove, e => this.trackMousedObject(e));
    stage.events.on(SpriteEvents.MouseDown, e => {
      const point  = new Point(e.data.global.x, e.data.global.y);
      const target = stage.findTopmostSpriteAt(point, true);

      this.setTarget(target);
    })
  }

  trackMousedObject(e: PIXI.interaction.InteractionEvent): void {
    let point = Point.From(e.data.global);

    if (!this.props.stage.contains(point)) {
      return;
    }

    if (Game.DEBUG_MODE) {
      let newMousedObject = this.props.stage.findTopmostSpriteAt(point, true);

      if (newMousedObject != this._currentMousedObject) {
        if (newMousedObject != null) {
          newMousedObject.alpha = 0.9;
        }

        if (this._currentMousedObject != null) {
          this._currentMousedObject.alpha = 1.0;
        }
        this._currentMousedObject = newMousedObject;
      }
    }
  }

  /**
   * We bind this function inline so that we can use it as an event and
   * clean it up later.
   */
  debugDraw = (target: Sprite) => {
    this._stageDebug.debug.draw(target);
  }

  setTarget(target: Sprite) {
    this.setState(state => {
      state.target = target;

      return state;
    });

    if (target == null) {
      if (this.transformWidget.parent) {
        this.transformWidget.parent.removeChild(this.transformWidget);
      }
    } else {
      target.addChild(this.transformWidget);

      this.transformWidget.x = target.width / 2;
      this.transformWidget.y = target.height / 2;

      this.debugDraw(target);

      this.state.target.events.on(SpriteEvents.Move, this.debugDraw);

      if (this._currentClickedObject) {
        this._currentClickedObject.events.off(SpriteEvents.Move, this.debugDraw);
      }

      this._currentClickedObject = target;
    }
  }

  render() {
    let hierarchy: JSX.Element = null,
        inspector: JSX.Element = null,
        log      : JSX.Element = null;

    if (Game.DEBUG_MODE) {
      hierarchy = <Hierarchy root={ this } target={ this.props.stage } focus={ this.state.target } />;
      inspector = <Inspector stage={ this.props.stage } target={ this.state.target } />;
    }

    log = <Log stage={ this.props.stage } root={ this } />;

    return (
      <div>
        <div id="main-panel">
          <div id="hierarchy">
            { hierarchy }
          </div>
          <div id="content" className="content"></div>
          { inspector }
        </div>

        { log }
      </div>
    );
  }
}
