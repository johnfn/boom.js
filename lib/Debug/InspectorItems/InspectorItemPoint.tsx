class InspectorItemPoint extends React.Component<InspectorItemProps, {}> {
  get point(): PIXI.Point {
    return this.props.target[this.props.propName];
  }

  constructor(props: InspectorItemProps) {
    super(props);
  }

  changed(e: React.SyntheticEvent) {
    const newValue = (e.target as any).value;

    this.props.target[this.props.propName] = newValue;
    this.props.onPropsChange();
  }

  mouseEnter() {
    this.props.debugLayer.drawPoint(this.point.x, this.point.y, this.props.propName);
  }

  mouseLeave() {
    this.props.debugLayer.clear(this.props.propName);
  }

  render() {
    var propValue: string = "" + this.props.target[this.props.propName];
    var value: JSX.Element;

    return (
      <div className="mutableProp"
        onMouseEnter={ () => this.mouseEnter() }
        onMouseLeave={ () => this.mouseLeave() }
        >
        <span className="prop-name">{ this.props.propName }: </span>

        <span className="prop">
          x: { this.point.x } y: { this.point.y }
        </span>
      </div>);
  }
}