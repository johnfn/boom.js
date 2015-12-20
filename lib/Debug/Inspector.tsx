interface InspectorItemProps {
  /**
   * Name of the property that we are inspecting
   * @type {string}
   */
  propName: string,

  /**
   * Object that the property we are inspecting is on.
   * @type {any}
   */
  target: any,

  /**
   * Call this function when the property changes.
   */
  onPropsChange: () => void,

  /**
   * Sprite we can use to render debugging information to the stage.
   * @type {Sprite}
   */
  debugSprite: Sprite
};

type InspectorProps = {
  stage: Stage,
  target: Sprite
};

class InspectorState { }

class Inspector extends React.Component<InspectorProps, InspectorState> {
  debugSprite: Sprite;

  public static instance: Inspector;

  constructor(props: InspectorProps) {
    super(props);

    this.state = { };
    this.debugSprite = new DebugSprite().addTo(this.props.stage);

    Inspector.instance = this;
  }

  innerPropChange(): void {
    Inspector.instance.forceUpdate();
  }

  render(): JSX.Element {
    if (this.props.target == null) {
      return <div> Nothing to inspect. </div>;
    }

    return (
      <div id="inspector">
        <div className="title"> Inspecting: { this.props.target.name } </div>

        <div className="prop-list">
          <InspectorItemObject
            target={ this.props }
            propName={ "target" }
            onPropsChange={ () => this.innerPropChange() }
            debugSprite={ this.debugSprite }
            open={ true } />
        </div>
      </div>
    );
  }
}
