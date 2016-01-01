import * as React from 'react';
import { InspectorItemProps } from './../Inspector.tsx'

export class InspectorItemPoint extends React.Component<InspectorItemProps, {}> {
  get point(): PIXI.Point {
    return this.props.target[this.props.propName];
  }

  constructor(props: InspectorItemProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div className='mutableProp'
        onMouseEnter={ () => this._mouseEnter() }
        >
        <span className='prop-name'>{ this.props.propName }: </span>

        <span className='prop'>
          x: { this.point.x } y: { this.point.y }
        </span>
      </div>);
  }

  private _mouseEnter(): void {
    this.props.debugSprite.debug.draw(this.point);
  }
}