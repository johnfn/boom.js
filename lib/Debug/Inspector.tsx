type InspectorItemProps = {
  propName: string,
  target: any,
  onPropsChange: () => void,
  debugSprite: Sprite,
  interactive: boolean
};

type InspectorProps = {
  stage: Stage,
  target: Sprite
};

class InspectorState {
}

class Inspector extends React.Component<InspectorProps, InspectorState> {
  debugSprite: Sprite;

  public static instance: Inspector;

  constructor(props: InspectorProps) {
    super(props);

    this.state = { };
    this.debugSprite = new Sprite().addTo(this.props.stage);
    this.debugSprite.z = Number.POSITIVE_INFINITY;

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
            interactive={ true } />
        </div>
      </div>
    );
  }
}
