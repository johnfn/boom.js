type SpriteState = { expanded: boolean };
type SpriteProps = { sprite: Sprite, debugSprite: Sprite, root: Root };

class SpriteCanvas extends Game {
  constructor(sprite: Sprite, element: HTMLElement) {
    super(sprite.width, sprite.height, element);

    this.stage.addChild(sprite.clone());
  }
}

class LogItemSprite extends React.Component<SpriteProps, SpriteState> {
  private _oldSprite: Sprite;

  constructor(props: SpriteProps) {
    super(props);

    this.state = { expanded: false };
    this._oldSprite = props.sprite
  }

  shouldComponentUpdate(): boolean {
    let result = this.props.sprite !== this._oldSprite;

    this._oldSprite = this.props.sprite;
    return result;
  }

  renderSprite(): void {
    new SpriteCanvas(this.props.sprite, React.findDOMNode(this) as HTMLElement);
  }

  // Called after first render.
  componentDidMount(): void {
    this.renderSprite();
  }

  // Called after every render except first.
  componentDidUpdate(prevProps: TextureProps, prevState: TextureState): void {
    this.renderSprite();
  }

  showSpriteDebugRectangle(): void {
    this.props.debugSprite.debug.draw(this.props.sprite);
  }

  setAsTarget(): void {
    this.props.root.setTarget(this.props.sprite);
  }

  render() {
    return <span
      onMouseOver={ () => this.showSpriteDebugRectangle() }
      onMouseDown={ () => this.setAsTarget() }
      > </span>;
  }
}
