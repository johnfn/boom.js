type InspectorObjectState = {
  target: Sprite;
  expanded: boolean;
};

interface InspectorObjectProps extends InspectorItemProps {
  open?: boolean;
}

class InspectorItemObject extends React.Component<InspectorObjectProps, InspectorObjectState> {
  get obj(): any {
    return this.props.target[this.props.propName];
  }

  constructor(props: InspectorItemProps) {
    super(props);

    this.state = {
      expanded: !!this.props.open,
      target: props.target,
    };
  }

  public render(): JSX.Element {
    let propList: JSX.Element[] = [];
    let expandButton = (
      <a href='#' onClick={ e => this._toggle(e) }>
        { this.state.expanded ? '-' : '+' }
      </a>
    );

    if (this.state.expanded) {
      for (const prop in this.obj) {
        const node = this._valueToElem(this.obj[prop], prop, this.props.debugSprite);

        if (!node) { continue; }

        propList.push(node);
      }
    }

    return (
      <div className='mutableProp'>
        <div className='prop-name'> { expandButton } { Util.GetClassName(this.obj) } <span className='prop'>{ this.props.propName }</span> </div>
        <div className='prop-list'>
          { propList }
        </div>
      </div>);
  }

  private _toggle(e: React.SyntheticEvent): void {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  private _valueToElem(value: any, propName: string, debugSprite: Sprite): JSX.Element {
    let node: JSX.Element;

    const itemArgs = {
      debugSprite   : debugSprite,
      onPropsChange : (): void => Inspector.instance.innerPropChange(),
      propName      : propName,
      target        : this.obj,
    };

    if (typeof value === 'string') {
      node = <InspectorItemString { ...itemArgs } />;
    } else if (typeof value === 'number' && Util.Contains(propName, 'tint')) {
      node = <InspectorItemColor { ...itemArgs }/>;
    } else if (typeof value === 'number') {
      node = <InspectorItemNumber { ...itemArgs } />;
    } else if (typeof value === 'function') {
      // Skip. No one cares about functions.

      // node = <InspectorItemFunction propName= { propName } />;
    } else if (value instanceof PIXI.Point) {
      node = <InspectorItemPoint { ...itemArgs } />;
    } else if (value instanceof PIXI.Rectangle) {
      node = <InspectorItemRect { ...itemArgs } />;
    } else if (typeof value === 'boolean') {
      node = <InspectorItemBoolean { ...itemArgs } />;
    } else if (typeof value === 'object') {
      node = <InspectorItemObject { ...itemArgs } />;
    } else {
      node = <div> { propName } </div>
    }

    return node;
  }
}
