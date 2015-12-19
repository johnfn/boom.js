class Color {
  public static Red: number = 0xff0000;
  public static Green: number = 0x00ff00;
  public static Blue: number = 0x0000ff;

  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  toHex(): string {
    return `0x${ this.r.toString(16) }${ this.g.toString(16) }${ this.b.toString(16) }`;
  }

  toNum(): number {
    return (1 << 24) + (this.r << 16) + (this.g << 8) + this.b;
  }

  static fromNum(num: number): Color {
    var b = num % 256; num = Math.floor(num / 256);
    var g = num % 256; num = Math.floor(num / 256);
    var r = num % 256; 

    return new Color(r, g, b);
  }
}

interface InspectorColorState { expanded: boolean, color: Color }
interface InspectorColorProps {
  propName: string;
  target: Sprite;
  interactive: boolean;
  onPropsChange: () => void;
}

class InspectorItemColor extends React.Component<InspectorColorProps, InspectorColorState> {
  constructor(props: InspectorColorProps) {
    super(props);

    this.state = {
      expanded: false,
      color: Color.fromNum(props.target[props.propName])
    };
  }

  expand() {
    this.setState(state => {
      state.expanded = !state.expanded;

      return state;
    });
  }

  change(newColor: Color) {
    this.setState(state => {
      state.color = newColor;

      console.log(newColor.toNum());

      this.props.target[this.props.propName] = newColor.toNum();
      this.props.onPropsChange();

      return state;
    });
  }

  render() {
    return (
      <div className="mutableProp">
        { this.props.propName }: <ColorSquare color={ this.state.color } onClick={ () => this.expand() } />
        <div>
          { this.state.expanded ? <InnerInspectorColor color={ this.state.color } onChange={ (newColor: Color) => this.change(newColor) } /> : null }
        </div>
      </div>);
  }
}

interface ColorSquareProps { color: Color, onClick: () => void } 
class ColorSquare extends React.Component<ColorSquareProps, {}> {
  render() {
    var square: React.CSSProperties = {
      width: "10px",
      height: "10px",
      border: "1px solid black",
      display: "inline-block",
      background: `rgb(${this.props.color.r}, ${this.props.color.g}, ${this.props.color.b})`
    };

    return <span style={ square } onClick={ this.props.onClick }> </span>;
  }
}

interface ColorSliderProps { color: Color, whichColor: string, onChange: (color: Color) => void }
interface ColorSliderState { value: number } 
class ColorSlider extends React.Component<ColorSliderProps, ColorSliderState> {
  mouseDown: boolean = false;

  constructor(props: ColorSliderProps) {
    super(props);

    let value: number;

    if (props.whichColor == "r") value = props.color.r;
    if (props.whichColor == "g") value = props.color.g;
    if (props.whichColor == "b") value = props.color.b;

    this.state = { value };
  }

  r(override: number = null): number {
    return this.props.whichColor == "r" ? (override == null ? this.state.value : override) : this.props.color.r;
  }

  g(override: number = null): number {
    return this.props.whichColor == "g" ? (override == null ? this.state.value : override) : this.props.color.g;
  }

  b(override: number = null): number {
    return this.props.whichColor == "b" ? (override == null ? this.state.value : override) : this.props.color.b;
  }

  updateValue(e: React.MouseEvent) {
    var x = e.pageX - $(e.currentTarget).offset().left;
    var newValue = Math.floor((x / 200) * 255);

    this.props.onChange(React.addons.update(this.props.color, { [this.props.whichColor]: { $set: newValue } }));
  }

  render() {
    var gradStart = `rgb(${ this.r(0) }, ${ this.g(0) }, ${ this.b(0) })`;
    var gradEnd = `rgb(${ this.r(255) }, ${ this.g(255) }, ${ this.b(255) })`;

    var rect: React.CSSProperties = {
      width: "200px",
      height: "10px",
      border: "1px solid gray",
      margin: "5px",
      background: `-ms-linear-gradient(left, ${gradStart} 0%, ${gradEnd} 100%)`
    };

    return <div
      style={ rect }
      onMouseDown={ e => { this.mouseDown = true; this.updateValue(e) } }
      onMouseUp={ () => { this.mouseDown = false; return undefined; } }
      onMouseMove={ e => this.mouseDown && this.updateValue(e) }
    > </div>;
  }
}

interface InnerColorProps { color: Color, onChange: (newColor: Color) => void }
class InnerInspectorColor extends React.Component<InnerColorProps, {}> {
  constructor(props: InnerColorProps) {
    super(props);
  }

  render() {
    var style: React.CSSProperties = {
      border: "1px solid gray"
    };

    return <div style={ style }>
      <ColorSlider color={ this.props.color } whichColor={ "r" } onChange={ (c: Color) => this.props.onChange(c) } />
      <ColorSlider color={ this.props.color } whichColor={ "g" } onChange={ (c: Color) => this.props.onChange(c) } />
      <ColorSlider color={ this.props.color } whichColor={ "b" } onChange={ (c: Color) => this.props.onChange(c) } />

      <div> Hex: { this.props.color.toHex() } </div>
    </div>;
  }
}