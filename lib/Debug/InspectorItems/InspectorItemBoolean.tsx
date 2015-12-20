class InspectorItemBoolean extends React.Component<InspectorItemProps, {}> {
  constructor(props: InspectorItemProps) {
    super(props);

    this.state = { target: props.target };
  }

  changed(e: React.SyntheticEvent) {
    const newValue = (e.target as any).value;

    React.addons.update(this.props.target, { [this.props.propName]: { $set: newValue } });
  }

  render() {
    var propValue: string = "" + this.props.target[this.props.propName];
    var value: JSX.Element;

    value = <span> { propValue } </span>;

    return (
      <div className="mutableProp">
        <span className="prop-name">{ this.props.propName }</span>: <span className="prop">{ value }</span>
      </div>);
  }
}
