enum DebugEvents {
  ChangeTarget
}

class Debug {
  public events = new Events<DebugEvents>();
  public transformWidget: TransformWidget;

  public static instance: Debug;

  private _currentTarget: Sprite;

  constructor() {
    this.transformWidget = new TransformWidget();
    Debug.instance = this;

    if (Game.DEBUG_MODE) {
      this.configureEvents();
    }
  }

  private configureEvents(): void {
    this.events.on(DebugEvents.ChangeTarget, (newSprite: Sprite) => {
      if (newSprite == null) {
        if (this.transformWidget.parent) {
          this.transformWidget.parent.removeChild(this.transformWidget);
        }
      } else {
        newSprite.addChild(this.transformWidget);

        this.transformWidget.x = newSprite.width / 2;
        this.transformWidget.y = newSprite.height / 2;
      }
    });
  }

  /**
   * Get the current Sprite that the debug mode is focused on.
   */
  public static get debugTarget(): Sprite {
    return Inspector.instance.props.target;
  }
}