type PointState = { expanded: boolean };
type PointProps = { point: PIXI.Point, debugSprite: Sprite };

class LogItemPoint extends React.Component<PointProps, PointState> {
  constructor(props: PointProps) {
    super(props);

    this.state = { expanded: true };
  }

  public render(): JSX.Element {
    let inner: JSX.Element;

    if (this.state.expanded) {
      inner = <span>
        <span className='prop'> x</span>: { this.props.point.x }
        <span className='prop'> y</span>: { this.props.point.y }
      </span>;
    } else {
      inner = <span> point </span>;
    }

    return (
      <span
        className='point'
        onMouseOver={ e => this._mouseOver(e) }
        onClick={ e => this._toggle(e) }
      >
        { inner }
      </span>
    );
  }

  private _toggle(e: React.MouseEvent): void {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  private _mouseOver(e: React.MouseEvent): void {
    this.props.debugSprite.debug.draw(this.props.point)
  }
}
