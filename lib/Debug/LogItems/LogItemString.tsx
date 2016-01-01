import * as React from 'react';
type StringState = { content: string };

export class LogItemString extends React.Component<StringState, StringState> {
  constructor(props: StringState) {
    super(props);

    this.state = { content: props.content };
  }

  public render(): JSX.Element {
    return <span> { this.state.content } </span>;
  }
}
