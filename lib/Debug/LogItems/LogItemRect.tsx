type RectState = { rect: PIXI.Rectangle, expanded: boolean };
type RectProps = { rect: PIXI.Rectangle, debugSprite: Sprite };

class LogItemRect extends React.Component<RectProps, RectState> {
  constructor(props: RectProps) {
    super(props);

    this.state = {
      expanded: false,
      rect: new PIXI.Rectangle(props.rect.x, props.rect.y, props.rect.width, props.rect.height),
    };
  }

  public render(): JSX.Element {
    let inner: JSX.Element;

    if (this.state.expanded) {
      inner = <span>
        <span className='prop'> x</span>: { this.state.rect.x }
        <span className='prop'> y</span>: { this.state.rect.y }
        <span className='prop'> width</span>: { this.state.rect.width }
        <span className='prop'> height</span>: { this.state.rect.height }
      </span>;
    } else {
      inner = <span> rect </span>;
    }

    return (
      <span
        className='rect'
        onMouseOver={ e => this._mouseOver(e) }
        onClick={ (e) => this._toggle(e) }
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
    this.props.debugSprite.debug.draw(this.state.rect);
  }
}
