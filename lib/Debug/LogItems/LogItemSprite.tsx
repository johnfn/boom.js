import * as React from 'react';
import { Sprite, Root, Game } from '../../Core.ts'

type SpriteState = { expanded: boolean };
type SpriteProps = { sprite: Sprite, debugSprite: Sprite, root: Root };

class SpriteCanvas extends Game {
  constructor(sprite: Sprite, element: HTMLElement) {
    super(sprite.width, sprite.height, element);

    this.stage.addChild(sprite.clone());
  }
}

export class LogItemSprite extends React.Component<SpriteProps, SpriteState> {
  private _oldSprite: Sprite;

  constructor(props: SpriteProps) {
    super(props);

    this.state = { expanded: false };
    this._oldSprite = props.sprite
  }

  public shouldComponentUpdate(): boolean {
    const result = this.props.sprite !== this._oldSprite;

    this._oldSprite = this.props.sprite;
    return result;
  }

  // Called after first render.
  public componentDidMount(): void {
    this._renderSprite();
  }

  // Called after every render except first.
  public componentDidUpdate(prevProps: SpriteProps, prevState: SpriteState): void {
    this._renderSprite();
  }

  public render(): JSX.Element {
    return <span
      onMouseOver={ () => this._showSpriteDebugRectangle() }
      onMouseDown={ () => this._setAsTarget() }
      > </span>;
  }

  private _showSpriteDebugRectangle(): void {
    this.props.debugSprite.debug.draw(this.props.sprite);
  }

  private _setAsTarget(): void {
    this.props.root.setTarget(this.props.sprite);
  }

  private _renderSprite(): void {
    new SpriteCanvas(this.props.sprite, React.findDOMNode(this) as HTMLElement);
  }
}
