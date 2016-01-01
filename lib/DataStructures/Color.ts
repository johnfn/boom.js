export class Color {
  public static RED  : number = 0xff0000;
  public static GREEN: number = 0x00ff00;
  public static BLUE : number = 0x0000ff;

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
