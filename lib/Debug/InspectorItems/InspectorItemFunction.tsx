type InspectorFunctionProps = {
  propName: string
};

class InspectorItemFunction extends React.Component<InspectorFunctionProps, {}> {
  render() {
    return <div><b>{ this.props.propName }</b> : [function]</div>;
  }
}