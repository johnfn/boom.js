﻿class Util {
  static Draw(item: Ray | Point | Polygon | PIXI.Rectangle, color: number = 0xff0000, alpha: number = 1) {
    Globals.stage.debug.draw(item, color, alpha);
  }

  static RunOnStart(func: () => void) {
    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {
      setTimeout(func); // setTimeout to allow the rest of the script to load.
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        func();
      });
    }
  }

  /**
   * Converts a single word to Title Case.
   * @param s 
   * @returns {} 
   */
  static ToTitleCase(s: string): string {
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  }

  static ArrayEq(a: any[], b: any[]): boolean {
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  static Sum(a: number[]): number {
    let result = 0;

    for (let i = 0; i < a.length; i++) {
      result += a[i];
    }

    return result;
  }

  /**
   * Returns the point of intersection, or null if there wasn't one.
   * 
   * @param ray1 
   * @param ray2 
   * @returns {} 
   */
  static RayRayIntersection(ray0: Ray, ray1: Ray): Maybe<Point> {
    const p0_x = ray0.x0;
    const p0_y = ray0.y0;

    const p1_x = ray0.x1;
    const p1_y = ray0.y1;

    const p2_x = ray1.x0;
    const p2_y = ray1.y0;

    const p3_x = ray1.x1;
    const p3_y = ray1.y1;

    let s1_x: number = p1_x - p0_x; let s1_y: number = p1_y - p0_y;
    let s2_x: number = p3_x - p2_x; let s2_y: number = p3_y - p2_y;

    let s: number = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    let t: number = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return new Maybe(new Point(p0_x + (t * s1_x), p0_y + (t * s1_y)))
    }

    return new Maybe<Point>();
  }

  /**
   * Returns whether the given point is inside the given rect.
   * @param rect 
   * @param point 
   * @returns {} 
   */
  static RectPointIntersection(rect: PIXI.Rectangle, point: Point): boolean {
    return rect.x <= point.x && rect.x + rect.width  >= point.x &&
           rect.y <= point.y && rect.y + rect.height >= point.y;
  }

  /**
   * Returns the point of collision of a ray and a rectangle that is closest
   * to the start of the ray, if there is one. 
   * @param ray 
   * @param rect 
   * @returns {} 
   */
  static RayRectIntersection(ray: Ray, rect: PIXI.Rectangle): Maybe<Point> {
    const lines: Ray[] = [
      new Ray(rect.x, rect.y, rect.x + rect.width, rect.y ),
      new Ray(rect.x, rect.y, rect.x, rect.y + rect.height ),
      new Ray(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height ),
      new Ray(rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height)
    ];

    let closest: Point = undefined;

    for (const rectLine of lines) {
      Util.RayRayIntersection(ray, rectLine).then(intersection => {
        if (closest == null || intersection.distance(ray.start) < closest.distance(ray.start)) {
          closest = intersection;
        }
      })
    }

    return new Maybe<Point>(closest);
  }

  static GetClassName(target: any) {
    if (target == null) {
      return "[null]";
    }

    if (target == undefined) {
      return "[undefined]";
    }

    // You can do something like Object.create(null) and make an object
    // with no constructor. Weird.
    if (!target.constructor) {
      return "[object]";
    }

    let constructor = ("" + target.constructor);

    if (constructor.indexOf("function ") !== -1) {
      return ("" + target.constructor).split("function ")[1].split("(")[0];
    } else {
      return "[stubborn builtin]"
    }
  }

  static StartsWith(str: string, prefix: string): boolean {
    return str.lastIndexOf(prefix, 0) === 0;
  }

  static Contains(str: string, inner: string): boolean {
    return str.toUpperCase().indexOf(inner.toUpperCase()) !== -1;
  }
}

/**
 * Adds console.watch to watch variables and hit breakpoints on changes
 * (handy for hunting down hard to find bugs!)
 */
(console as any).watch = function (oObj: any, sProp: any) {
  let sPrivateProp = "$_" + sProp + "_$"; // to minimize the name clash risk
  oObj[sPrivateProp] = oObj[sProp];

  // overwrite with accessor
  Object.defineProperty(oObj, sProp, {
    get: function () {
      return oObj[sPrivateProp];
    },

    set: function (value) {
      //console.log("setting " + sProp + " to " + value);
      debugger; // sets breakpoint
      oObj[sPrivateProp] = value;
    }
  });
}
