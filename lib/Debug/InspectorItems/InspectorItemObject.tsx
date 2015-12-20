type InspectorObjectState = {
  target: Sprite;
  expanded: boolean;
};

class InspectorItemObject extends React.Component<InspectorItemProps, InspectorObjectState> {
  constructor(props: InspectorItemProps) {
    super(props);

    this.state = {
      target: props.target,
      expanded: false
    };
  }

  toggle(e: React.SyntheticEvent) {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  render() {
    let propList: JSX.Element[] = [];
    let expandedObject = this.state.target[this.props.propName];
    let expandButton = (
      <a href="#" onClick={ e => this.toggle(e) }>
        { this.state.expanded ? "-" : "+" }
      </a>
    );

    if (this.state.expanded) {

      for (var prop in expandedObject){
        let value = expandedObject[prop];
        let node: JSX.Element = Inspector.valueToElem(value, prop, expandedObject, true, this.props.debugLayer);

        if (!node) continue;

        propList.push(node);
      }
    }

    return (
      <div className="mutableProp">
        <div className="prop-name"> { expandButton } { Util.GetClassName(expandedObject) } <span className="prop">{ this.props.propName }</span> </div>
        <div className="prop-list">
          { propList }
        </div>
      </div>);
  }
}
