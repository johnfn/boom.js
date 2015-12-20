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
    const propValue: string = "" + this.props.target[this.props.propName];

    return (
      <div className="mutableProp">
        <span className="prop-name">{ this.props.propName }</span>:
        <span className="prop">
          <input
            type="text"
            onChange={ e => this.changed(e) }
            value={ propValue } />
        </span>
      </div>);
  }
}
