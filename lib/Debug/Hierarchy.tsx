type HierarchyProps = {
  debugLayer: DebugLayer;
  root: Root;

  /**
   * The sprite that is the focus of this element of the hierarchy.
   */
  target: Sprite;

  /**
   * The sprite that is currently receiving focus, or null if there isn't one.
   */
  focus: Sprite;
}

type HierarchyState = {
  collapsed: boolean
}

class Hierarchy extends React.Component<HierarchyProps, HierarchyState> {
  constructor(props: HierarchyProps) {
    super();

    this.state = {
      collapsed: props.target.children.length > 20
    };
  }

  click() {
    this.props.root.setTarget(this.props.target);
  }

  toggle() {
    this.setState(state => {
      state.collapsed = !state.collapsed;

      return state;
    });
  }

  render(): JSX.Element {
    let subNodes: JSX.Element;

    if (!this.state.collapsed) {
      subNodes = (
        <div className="prop-list">
            { this.props.target.children.map(o =>
              <Hierarchy
                target={ o }
                debugLayer={ this.props.debugLayer }
                root={ this.props.root }
                focus={ this.props.focus }/>).arr()
            }
        </div>);
    }

    return (
      <div>
        { /* test */ }
        <a href="#"
           onClick={ () => this.click() }
           className={ this.props.target === this.props.root.state.target ? "target-element" : null }>
          { this.props.target.name }
        </a>
        <span
          onClick={ () => this.toggle() }
          > { this.props.target.children.length > 0 ? (this.state.collapsed ? "[+]" : "[-]") : "" }
        </span>
        { subNodes }
      </div>);
  }
}