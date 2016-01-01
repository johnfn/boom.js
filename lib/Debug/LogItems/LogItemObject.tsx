import * as React from 'react';
import { Root } from '../../Root.tsx'

type Obj = { [key: string]: any; };

type ObjectState = { expanded: boolean };
type ObjectProps = {
  object: Obj,
  root: Root
};

export class LogItemObject extends React.Component<ObjectProps, ObjectState> {
  constructor(props: ObjectProps) {
    super(props);

    this.state = { expanded: false };
  }

  public render(): JSX.Element {
    const inner: JSX.Element[] = [];

    for (const key in this.props.object) {
      if (!this.props.object.hasOwnProperty(key)) { continue; }

      const item = this.props.object[key]

      inner.push(<div>
        <b>{ key }</b>: { item ? item.toString() : '<null>' }
      </div>);
    }

    return (
      <span className='object'>
        { inner }
      </span>
    );
  }
}
