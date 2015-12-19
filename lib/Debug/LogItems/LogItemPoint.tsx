type PointState = { expanded: boolean };
type PointProps = { point: PIXI.Point, debugLayer: DebugLayer };

class LogItemPoint extends React.Component<PointProps, PointState> {
  // Uid
  uid: () => string;
  _uid: string;

  constructor(props: PointProps) {
    super(props);

    this.state = { expanded: true };
  }

  toggle(e: React.MouseEvent) {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  mouseOver(e: React.MouseEvent) {
    this.props.debugLayer.drawPoint(this.props.point.x, this.props.point.y, "point");
  }

  mouseOut(e: React.MouseEvent) {
    this.props.debugLayer.clear("point");
  }

  render() {
    var inner: JSX.Element;

    if (this.state.expanded) {
      inner = <span>
        <span className="prop"> x</span>: { this.props.point.x }
        <span className="prop"> y</span>: { this.props.point.y }
      </span>;
    } else {
      inner = <span> point </span>;
    }

    return (
      <span
        className="point"
        onMouseOver={ e => this.mouseOver(e) }
        onMouseOut={ e => this.mouseOut(e) }
        onClick={ e => this.toggle(e) }
      >
        { inner }
      </span>
    );
  }
}
