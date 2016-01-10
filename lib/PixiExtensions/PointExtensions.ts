class Point extends PIXI.Point {
  public static From(p: PIXI.Point): Point {
    return new Point(p.x, p.y);
  }

  constructor(x: number, y: number) {
    super(x, y);
  }

  public distance(other: Point): number {
    return Math.sqrt(Math.pow(other.x - this.x, 2) +
                     Math.pow(other.y - this.y, 2));
  }

  public add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  public subtract(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }
}