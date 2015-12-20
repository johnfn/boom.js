interface RootProps {
  stage: Stage;
}

interface RootState {
  target: Sprite;
  debugLayer: DebugLayer;
}

/**
 * Root is the react component at the base of the HTML hierarchy.
 */
class Root extends React.Component<RootProps, RootState> {
  private _currentMousedObject: Sprite;

  public transformWidget = new TransformWidget();

  constructor(props: RootProps) {
    super(props);

    const stage = props.stage;

    this.state = {
      target: null,
      debugLayer: new DebugLayer(stage)
    };

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

      target.debug.draw(target);
    }
  }

  render() {
    let hierarchy: JSX.Element = null,
        inspector: JSX.Element = null,
        log      : JSX.Element = null;

    if (Game.DEBUG_MODE) {
      hierarchy = <Hierarchy root={ this } target={ this.props.stage } focus={ this.state.target } />;
      inspector = <Inspector debugLayer={ this.state.debugLayer } target={ this.state.target } />;
    }

    log = <Log stage={ this.props.stage } debugLayer={ this.state.debugLayer } root={ this } />;

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
