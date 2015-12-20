type InspectorFunctionProps = {
  propName: string
};

// (Currently unused.)

class InspectorItemFunction extends React.Component<InspectorFunctionProps, {}> {
  public render(): JSX.Element {
    return <div><b>{ this.props.propName }</b> : [function]</div>;
  }
}