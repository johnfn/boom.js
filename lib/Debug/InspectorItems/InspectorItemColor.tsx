class Color {
  public static RED  : number = 0xff0000;
  public static GREEN: number = 0x00ff00;
  public static BLUE : number = 0x0000ff;
  public static WHITE: number = 0xffffff;

  public r: number;
  public g: number;
  public b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public static fromNum(num: number): Color {
    const b = num % 256; num = Math.floor(num / 256);
    const g = num % 256; num = Math.floor(num / 256);
    const r = num % 256;

    return new Color(r, g, b);
  }

  public toHex(): string {
    return `0x${ this.r.toString(16) }${ this.g.toString(16) }${ this.b.toString(16) }`;
  }

  public toNum(): number {
    return (1 << 24) + (this.r << 16) + (this.g << 8) + this.b;
  }
}

interface InspectorColorState { expanded: boolean, color: Color }
interface InspectorColorProps {
  propName      : string;
  target        : any;
  onPropsChange : () => void;
}

class InspectorItemColor extends React.Component<InspectorColorProps, InspectorColorState> {
  constructor(props: InspectorColorProps) {
    super(props);

    this.state = {
      color: Color.fromNum(props.target[props.propName]),
      expanded: false,
    };
  }

  public render(): JSX.Element {
    return (
      <div className='mutableProp'>
        { this.props.propName }: <ColorSquare color={ this.state.color } onClick={ () => this._expand() } />
        <div>
          { this.state.expanded ? <InnerInspectorColor color={ this.state.color } onChange={ (newColor: Color) => this._change(newColor) } /> : undefined }
        </div>
      </div>);
  }

  private _expand(): void {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  private _change(newColor: Color): void {
    this.setState(state => {
      state.color = newColor;

      console.log(newColor.toNum());

      this.props.target[this.props.propName] = newColor.toNum();
      this.props.onPropsChange();

      return state;
    });
  }
}

interface ColorSquareProps { color: Color, onClick: () => void }
class ColorSquare extends React.Component<ColorSquareProps, {}> {
  public render(): JSX.Element {
    const square: React.CSSProperties = {
      background: `rgb(${this.props.color.r}, ${this.props.color.g}, ${this.props.color.b})`,
      border: '1px solid black',
      display: 'inline-block',
      height: '10px',
      width: '10px',
    };

    return <span style={ square } onClick={ this.props.onClick }> </span>;
  }
}

interface ColorSliderProps { color: Color, whichColor: string, onChange: (color: Color) => void }
interface ColorSliderState { value: number }
class ColorSlider extends React.Component<ColorSliderProps, ColorSliderState> {
  private _mouseDown: boolean = false;

  constructor(props: ColorSliderProps) {
    super(props);

    let value: number;

    if (props.whichColor === 'r') value = props.color.r;
    if (props.whichColor === 'g') value = props.color.g;
    if (props.whichColor === 'b') value = props.color.b;

    this.state = { value };
  }

  public r(override: number = undefined): number {
    return this.props.whichColor === 'r' ? (override === undefined ? this.state.value : override) : this.props.color.r;
  }

  public g(override: number = undefined): number {
    return this.props.whichColor === 'g' ? (override === undefined ? this.state.value : override) : this.props.color.g;
  }

  public b(override: number = undefined): number {
    return this.props.whichColor === 'b' ? (override === undefined ? this.state.value : override) : this.props.color.b;
  }

  public render(): JSX.Element {
    const gradStart = `rgb(${ this.r(0) }, ${ this.g(0) }, ${ this.b(0) })`;
    const gradEnd = `rgb(${ this.r(255) }, ${ this.g(255) }, ${ this.b(255) })`;

    const rect: React.CSSProperties = {
      background: `-ms-linear-gradient(left, ${gradStart} 0%, ${gradEnd} 100%)`,
      border: '1px solid gray',
      height: '10px',
      margin: '5px',
      width: '200px',
    };

    return <div
      style={ rect }
      onMouseDown={ e => { this._mouseDown = true; this._updateValue(e) } }
      onMouseUp={ () => { this._mouseDown = false; return undefined; } }
      onMouseMove={ e => this._mouseDown && this._updateValue(e) }
    > </div>;
  }

  private _updateValue(e: React.MouseEvent): void {
    const x = e.pageX - $(e.currentTarget).offset().left;
    const newValue = Math.floor((x / 200) * 255);

    this.props.onChange(React.addons.update(this.props.color, { [this.props.whichColor]: { $set: newValue } }));
  }
}

interface InnerColorProps { color: Color, onChange: (newColor: Color) => void }
class InnerInspectorColor extends React.Component<InnerColorProps, {}> {
  constructor(props: InnerColorProps) {
    super(props);
  }

  public render(): JSX.Element {
    const style: React.CSSProperties = {
      border: '1px solid gray'
    };

    return <div style={ style }>
      <ColorSlider color={ this.props.color } whichColor={ 'r' } onChange={ (c: Color) => this.props.onChange(c) } />
      <ColorSlider color={ this.props.color } whichColor={ 'g' } onChange={ (c: Color) => this.props.onChange(c) } />
      <ColorSlider color={ this.props.color } whichColor={ 'b' } onChange={ (c: Color) => this.props.onChange(c) } />

      <div> Hex: { this.props.color.toHex() } </div>
    </div>;
  }
}