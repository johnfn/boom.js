class InspectorItemNumber extends React.Component<InspectorItemProps, {}> {
  constructor(props: InspectorItemProps) {
    super(props);
  }

  changed(e: React.SyntheticEvent) {
    const newValue:number = parseInt((e.target as any).value);

    this.props.target[this.props.propName] = newValue;
    this.props.onPropsChange();
  }

  render() {
    var propValue: string = "" + this.props.target[this.props.propName];
    var value: JSX.Element;

    if (this.props.interactive) {
      value = (
        <input
          type="text"
          onChange={ e => this.changed(e) }
          value={ propValue }
          />);
    } else {
      value = <span> { propValue } </span>;
    }

    return (
      <div className="mutableProp">
        <span className="prop-name">{ this.props.propName }</span>: <span className="prop">{ value }</span>
      </div>);
  }
}
