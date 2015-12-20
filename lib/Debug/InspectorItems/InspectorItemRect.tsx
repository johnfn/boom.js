class InspectorItemRect extends React.Component<InspectorItemProps, {}> {
  get rect(): PIXI.Rectangle {
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
    if (this.rect) {
      this.props.debugLayer.drawRect(this.rect, this.props.propName);
    }
  }

  mouseLeave() {
    this.props.debugLayer.clear(this.props.propName);
  }

  render() {
    var propValue: string = "" + this.props.target[this.props.propName];
    var value: JSX.Element;

    if (this.rect) {
      value = <span> x: { this.rect.x } y: { this.rect.y } w: { this.rect.width } h: { this.rect.height } </span>;
    } else {
      value = <span> [null] </span>;
    }

    return (
      <div className="mutableProp"
        onMouseEnter={ () => this.mouseEnter() }
        onMouseLeave={ () => this.mouseLeave() }
        >
        <span className="prop-name">{ this.props.propName }: </span>

        <span className="prop">
          { value }
        </span>
      </div>);
  }
}
