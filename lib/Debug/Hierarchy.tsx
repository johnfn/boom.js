import * as React from 'react';
import { Root } from '../Root.tsx'
import { Sprite } from '../Core.ts'

type HierarchyProps = {
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

export class Hierarchy extends React.Component<HierarchyProps, HierarchyState> {
  constructor(props: HierarchyProps) {
    super();

    this.state = {
      collapsed: props.target.children.length > 20
    };
  }

  public render(): JSX.Element {
    let subNodes: JSX.Element;

    if (!this.state.collapsed) {
      subNodes = (
        <div className='prop-list'>
            { this.props.target.children.map((o, i) =>
              <span key={ o.inspect.name }>
                <Hierarchy
                  target={ o }
                  root={ this.props.root }
                  focus={ this.props.focus }/>
              </span>).arr()
            }
        </div>);
    }

    return (
      <div>
        <a href='#'
           onClick={ () => this._click() }
           className={ this.props.target === this.props.root.state.target ? 'target-element' : undefined }>
          { this.props.target.inspect.name }
        </a>
        <span
          onClick={ () => this._toggle() }
          > { this.props.target.children.length > 0 ? (this.state.collapsed ? '[' + this.props.target.children.length  + '+]' : '[-]') : '' }
        </span>
        { subNodes }
      </div>);
  }

  private _click(): void {
    this.props.root.setTarget(this.props.target);
  }

  private _toggle(): void {
    this.setState(state => {
      state.collapsed = !state.collapsed;

      return state;
    });
  }
}