import * as React from 'react';
import { InspectorItemProps } from './../Inspector.tsx'

export class InspectorItemBoolean extends React.Component<InspectorItemProps, {}> {
  constructor(props: InspectorItemProps) {
    super(props);

    this.state = { target: props.target };
  }

  public render(): JSX.Element {
    const propValue: string = '' + this.props.target[this.props.propName];
    const value: JSX.Element = <span> { propValue } </span>;

    return (
      <div className='mutableProp'>
        <span className='prop-name'>{ this.props.propName }</span>: <span className='prop'>{ value }</span>
      </div>);
  }
}
