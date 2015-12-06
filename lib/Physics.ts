interface Physics {
  solid: boolean;
  immovable: boolean;
}

class Ray {
  x0: number;
  y0: number;
  x1: number;
  y1: number;

  public get start(): Point { return new Point(this.x0, this.y0); }

  public get end(): Point { return new Point(this.x1, this.y1); }

  constructor(x0: number, y0: number, x1: number, y1: number) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  public static FromPoints(start: Point, end: Point): Ray {
    return new Ray(start.x, start.y, end.x, end.y);
  }
}

class PhysicsManager {
  private _sprites = new MagicArray<Sprite>();

  constructor() {
    
  }

  moveSpriteX(sprite: Sprite, dx: number): void {
    const rayStartX = sprite.x + (dx > 0 ? sprite.width : 0);
    const rayEndX   = rayStartX + dx;
    const raySpacing = 2;

    for (let y = sprite.y; y < sprite.y + sprite.height; y += raySpacing) {
      const ray = new Ray(rayStartX, y, rayEndX, y);

      sprite.debug.draw(ray);
    }
  }

  moveSpriteY(sprite: Sprite, dy: number): void {
    // const firstRayY = new Point(dy

    sprite.y += dy;
  }

  moveSprite(sprite: Sprite, dx: number, dy: number): void {
    // x

    if (dx != 0) this.moveSpriteX(sprite, dx);
    if (dy != 0) this.moveSpriteY(sprite, dy);
  }

  update(): void {
    // move all sprites

    for (const sprite of this._sprites) {
      this.moveSprite(sprite, sprite.physics.dx, sprite.physics.dy);
    }

    for (const sprite of this._sprites) {
      sprite.physics.reset();
    }
  }

  add(sprite: Sprite): void {
    this._sprites.push(sprite);
  }

  /**
   * Raycasts from a given ray, returning the first sprite that the ray intersects.
   * Ignores any sprite that the start of the ray is already colliding with.
   * 
   * @param ray 
   * @returns {} 
   */
  raycast(ray: Ray): Maybe<RaycastResult> {
    // TODO could (should) use a quadtree or something

    let result: RaycastResult = undefined;

    for (var sprite of this._sprites) { // TODO: could update var in a later version of TS.
      if (Util.RectPointIntersection(sprite.bounds, ray.start)) {
        // The ray started in this sprite; disregard
        continue;
      }

      Util.RayRectIntersection(ray, sprite.bounds).then(position => {
        if (result === undefined ||
            ray.start.distance(position) < ray.start.distance(result.position)) {

          result = {
            position,
            sprite
          };
        }
      });
    }

    return new Maybe(result);
  }
}

interface RaycastResult {
  sprite: Sprite;
  position: Point;
}

class PhysicsComponent extends Component {
  public dx: number = 0;
  public dy: number = 0;

  public touchingBottom : boolean = false;
  public touchingTop    : boolean = false;
  public touchingRight  : boolean = false;
  public touchingLeft   : boolean = false;

  public solid    : boolean;
  public immovable: boolean;

  constructor(physics: Physics) {
    super();

    this.solid     = physics.solid;
    this.immovable = physics.immovable;
  }

  init(sprite: Sprite): void {
    super.init(sprite);

    Globals.physicsManager.add(sprite)
  }

  moveBy(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
  }

  /**
   * Resets any physics changes the attached Sprite would have received on this turn.
   * @returns {} 
   */
  reset(): void {
    this.dx = 0;
    this.dy = 0;
  }

  postUpdate(): void { }
  preUpdate(): void { }
  update(): void { }
}