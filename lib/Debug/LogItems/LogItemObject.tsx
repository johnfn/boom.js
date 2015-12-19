type Obj = { [key: string]: any; };

type ObjectState = { expanded: boolean };
type ObjectProps = {
  object: Obj,
  debugLayer: DebugLayer,
  root: Root
};

class LogItemObject extends React.Component<ObjectProps, ObjectState> {
  constructor(props: ObjectProps) {
    super(props);

    this.state = { expanded: false };
  }

  toggle(e: React.MouseEvent) {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  render() {
    var inner: JSX.Element[] = [];

    for (const key in this.props.object) {
      const item = this.props.object[key]

      inner.push(<div>
        <b>{ key }</b>: { item ? item.toString() : "<null>" }
      </div>);
    }

    return (
      <span className="object">
        { inner }
      </span>
    );
  }
}
