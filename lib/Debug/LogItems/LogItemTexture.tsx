type TextureState = { }
type TextureProps = { texture: PIXI.Texture, debugLayer: DebugLayer}

class TextureCanvas extends Game {
  constructor(texture: PIXI.Texture, element: HTMLElement) {
    super(texture.width, texture.height, element);

    let texturedSprite = new Sprite(texture.baseTexture.imageUrl);
    this.stage.addChild(texturedSprite);
  }
}

class LogItemTexture extends React.Component<TextureProps, TextureState> {
  oldTextureUrl: string = "";

  constructor(props: TextureProps) {
    super(props);

    this.state = {};
  }

  renderTexture(): void {
    this.oldTextureUrl = this.props.texture.baseTexture.imageUrl;

    let showTexture = () => {
      new TextureCanvas(this.props.texture, React.findDOMNode(this) as HTMLElement);
    };

    if (this.props.texture.baseTexture.hasLoaded) {
      showTexture();
    } else {
      setTimeout(showTexture, 0);
    }
  }

  shouldComponentUpdate(): boolean {
    return this.props.texture.baseTexture.imageUrl != this.oldTextureUrl;
  }

  // Called after first render.
  componentDidMount(): void {
    this.renderTexture();
  }

  // Called after every render except first.
  componentDidUpdate(prevProps: TextureProps, prevState: TextureState): void {
    this.renderTexture();
  }

  render() {
    return <div> Imatexture! </div>;
  }
}