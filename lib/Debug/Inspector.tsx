type InspectorItemProps = {
  propName: string,
  target: Sprite,
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

  public static valueToElem(value: any, propName: string, sprite: Sprite, interactive: boolean, debugSprite: Sprite): JSX.Element {
    let node: JSX.Element;

    const itemArgs = {
      propName: propName,
      debugSprite: debugSprite,
      target: sprite,
      interactive: interactive,
      onPropsChange: () => Inspector.instance.innerPropChange()
    };

    if (typeof value === "string") {
      node = <InspectorItemString { ...itemArgs } />;
    } else if (typeof value === "number" && Util.Contains(propName, "tint")) {
      node = <InspectorItemColor { ...itemArgs }/>;
    } else if (typeof value === "number") {
      node = <InspectorItemNumber { ...itemArgs } />;
    } else if (typeof value === "function") {
      // Skip. No one cares about functions.

      // node = <InspectorItemFunction propName= { propName } />;
    } else if (value instanceof PIXI.Point) {
      node = <InspectorItemPoint { ...itemArgs } />;
    } else if (value instanceof PIXI.Rectangle) {
      node = <InspectorItemRect { ...itemArgs } />;
    } else if (typeof value === "boolean") {
      node = <InspectorItemBoolean { ...itemArgs } />;
    } else if (typeof value === "object") {
      node = <InspectorItemObject { ...itemArgs } />;
    } else {
      node = <div> { propName } </div>
    }

    return node;
  }

  render(): JSX.Element {
    if (this.props.target == null) {
      return <div> Nothing to inspect. </div>;
    }

    let propList: JSX.Element[] = [];
    let immutablePropList: JSX.Element[] = [];

    for (var prop in this.props.target) {
      let value = this.props.target[prop];
      let modifiable = this.props.target.inspectableProperties.indexOf(prop) !== -1
      let node: JSX.Element = Inspector.valueToElem(value, prop, this.props.target, modifiable, this.debugSprite);

      if (!node) continue;

      if (modifiable) {
        propList.push(node);
      } else {
        immutablePropList.push(node);
      }
    }

    return (
      <div id="inspector">
        <div className="title"> Inspecting: { this.props.target.name } </div>

        <div className="prop-list">
          { propList }
        </div>

        <div className="dividing-label">
          Other Properties:
        </div>

        <div className="prop-list">
          { immutablePropList }
        </div>
      </div>
    );
  }
}
