﻿interface RootProps {
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

type PIXIMouseEvent = PIXI.interaction.InteractionEvent;

/**
 * Root is the react component at the base of the HTML hierarchy.
 */
class Root extends React.Component<RootProps, RootState> {
  public transformWidget: TransformWidget;

  private _currentMousedObject : Sprite;
  private _currentClickedObject: Sprite;
  private _stageDebug          : Sprite;

  /**
   * We bind this function inline so that we can use it as an event and
   * clean it up later.
   */
  private _debugDraw = () => {
    if (this.state.target) {
      this._stageDebug.debug.draw(this.state.target);
    } else {
      this._stageDebug.debug.clear();
    }
  };

  constructor(props: RootProps) {
    super(props);

    const stage = props.stage;

    this.transformWidget = new TransformWidget();

    this.transformWidget.addTo(stage);

    this.state = { target: undefined };

    this._stageDebug = new DebugSprite().addTo(props.stage);

    stage.events.on(SpriteEvents.MouseMove, (e: PIXIMouseEvent) => this._trackMousedObject(e));
    stage.events.on(SpriteEvents.MouseDown, (e: PIXIMouseEvent) => {
      const point  = new Point(e.data.global.x, e.data.global.y);
      const target = stage.findTopmostSpriteAt(point, true);

      this.setTarget(target);
    })

    Globals.camera.events.on(CameraEvents.Move, () => this._debugDraw());
  }

  public setTarget(target: Sprite): void {
    const oldTarget = this.state.target;

    this.setState((state: RootState) => {
      state.target = target;

      return state;
    },            () => {
      if (target === undefined) {
        this.transformWidget.visible = false;
      } else if (target === this.transformWidget) {

      } else {
        this.transformWidget.visible = true;

        this.transformWidget.setTarget(target);

        // The ordering ensures nothing bad happens if we switch to the same thing.

        if (this._currentClickedObject) {
          this._currentClickedObject.events.off(SpriteEvents.Move, this._debugDraw);
        }

        this.state.target.events.on(SpriteEvents.Move, this._debugDraw);

        this._currentClickedObject = target;
      }

      if (oldTarget) {
        oldTarget.events.off(SpriteEvents.Move, this._debugDraw);
      }

      this._debugDraw();
    });
  }

  public render(): JSX.Element {
    let hierarchy: JSX.Element,
        inspector: JSX.Element,
        log      : JSX.Element;

    if (Game.DEBUG_MODE) {
      hierarchy = <Hierarchy root={ this } target={ this.props.stage } focus={ this.state.target } />;
      inspector = <Inspector stage={ this.props.stage } target={ this.state.target } />;
    }

    log = <Log stage={ this.props.stage } root={ this } />;

    return (
      <div>
        <div id='main-panel'>
          <div id='hierarchy'>
            { hierarchy }
          </div>
          <div id='content' className='content'></div>
          { inspector }
        </div>

        { log }
      </div>
    );
  }

  /**
   * Indicate which composite is under the mouse.
   */
  private _trackMousedObject(e: PIXI.interaction.InteractionEvent): void {
    let point = Point.From(e.data.global);

    if (!this.props.stage.contains(point)) {
      return;
    }

    if (Game.DEBUG_MODE) {
      let newMousedObject = this.props.stage.findTopmostSpriteAt(point, true);

      if (newMousedObject !== this._currentMousedObject) {
        if (newMousedObject !== undefined) {
          newMousedObject.alpha = 0.9;
        }

        if (this._currentMousedObject !== undefined) {
          this._currentMousedObject.alpha = 1.0;
        }
        this._currentMousedObject = newMousedObject;
      }
    }
  }
}
