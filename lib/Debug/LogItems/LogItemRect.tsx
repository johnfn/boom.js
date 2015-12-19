type RectState = { rect: PIXI.Rectangle, expanded: boolean };
type RectProps = { rect: PIXI.Rectangle, debug: DebugLayer };

class LogItemRect extends React.Component<RectProps, RectState> {
  debug: DebugLayer;

  constructor(props: RectProps) {
    super(props);

    this.debug = props.debug;
    this.state = {
      rect: new PIXI.Rectangle(props.rect.x, props.rect.y, props.rect.width, props.rect.height),
      expanded: false
    };
  }

  toggle(e: React.MouseEvent) {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  mouseOver(e: React.MouseEvent) {
    this.debug.drawRect(
      this.state.rect.x,
      this.state.rect.y,
      this.state.rect.x + this.state.rect.width,
      this.state.rect.y + this.state.rect.height,
      "rect");
  }

  mouseOut(e: React.MouseEvent) {
    this.debug.clear("rect");
  }

  render() {
    var inner: JSX.Element;

    if (this.state.expanded) {
      inner = <span>
        <span className="prop"> x</span>: { this.state.rect.x }
        <span className="prop"> y</span>: { this.state.rect.y }
        <span className="prop"> width</span>: { this.state.rect.width }
        <span className="prop"> height</span>: { this.state.rect.height }
      </span>;
    } else {
      inner = <span> rect </span>;
    }

    return (
      <span
        className="rect"
        onMouseOver={ e => this.mouseOver(e) }
        onClick={ (e) => this.toggle(e) }
        onMouseOut={ e => this.mouseOut(e) }
      >
        { inner }
      </span>
    );
  }
}
