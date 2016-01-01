import * as React from 'react';
import { InspectorItemProps } from './../Inspector.tsx'

export class InspectorItemString extends React.Component<InspectorItemProps, {}> {
  constructor(props: InspectorItemProps) {
    super(props);
  }

  public render(): JSX.Element {
    const propValue: string = '' + this.props.target[this.props.propName];

    return (
      <div className='mutableProp'>
        <span className='prop-name'>{ this.props.propName }</span>:
        <span className='prop'>
          <input
            type='text'
            onChange={ e => this._changed(e) }
            value={ propValue }
            />
        </span>
      </div>);
  }

  private _changed(e: React.SyntheticEvent): void {
    const newValue = (e.target as any).value;

    this.props.target[this.props.propName] = newValue;
    this.props.onPropsChange();
  }
}
