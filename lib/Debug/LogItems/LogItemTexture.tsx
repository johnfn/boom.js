import * as React from 'react';
import { Sprite, Game } from '../../Core.ts'

type TextureState = { }
type TextureProps = { texture: PIXI.Texture }

class TextureCanvas extends Game {
  constructor(texture: PIXI.Texture, element: HTMLElement) {
    super(texture.width, texture.height, element);

    let texturedSprite = new Sprite(texture.baseTexture.imageUrl);
    this.stage.addChild(texturedSprite);
  }
}

export class LogItemTexture extends React.Component<TextureProps, TextureState> {
  private _oldTextureUrl: string = '';

  constructor(props: TextureProps) {
    super(props);

    this.state = {};
  }

  public render(): JSX.Element {
    return <div> Imatexture! </div>;
  }

  public shouldComponentUpdate(): boolean {
    return this.props.texture.baseTexture.imageUrl !== this._oldTextureUrl;
  }

  // Called after first render.
  public componentDidMount(): void {
    this._renderTexture();
  }

  // Called after every render except first.
  public componentDidUpdate(prevProps: TextureProps, prevState: TextureState): void {
    this._renderTexture();
  }

  private _renderTexture(): void {
    this._oldTextureUrl = this.props.texture.baseTexture.imageUrl;

    const showTexture = () => {
      new TextureCanvas(this.props.texture, React.findDOMNode(this) as HTMLElement);
    };

    if (this.props.texture.baseTexture.hasLoaded) {
      showTexture();
    } else {
      setTimeout(showTexture, 0);
    }
  }

}