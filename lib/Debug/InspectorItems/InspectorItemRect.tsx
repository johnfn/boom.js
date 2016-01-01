import * as React from 'react';
import { InspectorItemProps } from './../Inspector.tsx'

export class InspectorItemRect extends React.Component<InspectorItemProps, {}> {
  get rect(): PIXI.Rectangle {
    return this.props.target[this.props.propName];
  }

  constructor(props: InspectorItemProps) {
    super(props);
  }

  public render(): JSX.Element {
    let value: JSX.Element;

    if (this.rect) {
      value = <span> x: { this.rect.x } y: { this.rect.y } w: { this.rect.width } h: { this.rect.height } </span>;
    } else {
      value = <span> [null] </span>;
    }

    return (
      <div className='mutableProp'
        onMouseEnter={ () => this._mouseEnter() }
        >
        <span className='prop-name'>{ this.props.propName }: </span>

        <span className='prop'>
          { value }
        </span>
      </div>);
  }

  private _mouseEnter(): void {
    this.props.debugSprite.debug.draw(this.rect);
  }
}
