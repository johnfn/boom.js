import { Point } from '../DataStructures.ts'

export class Ray {
  public x0: number;
  public y0: number;
  public x1: number;
  public y1: number;

  public get start(): Point { return new Point(this.x0, this.y0); }

  public get end(): Point { return new Point(this.x1, this.y1); }

  public static FromPoints(start: Point, end: Point): Ray {
    return new Ray(start.x, start.y, end.x, end.y);
  }

  constructor(x0: number, y0: number, x1: number, y1: number) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  public add(x: number, y: number): this {
    this.x0 += x;
    this.x1 += x;

    this.y0 += y;
    this.y1 += y;

    return this;
  }
}
