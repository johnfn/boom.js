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

  private static SKIN_WIDTH = 1;
  private static RAY_SPACING = 8;

  constructor() {
    
  }

  moveSpriteX(sprite: Sprite, dx: number): void {
    const spriteSideX = sprite.x + (dx > 0 ? sprite.width : 0);
    const rayStartX   = spriteSideX + (dx > 0 ? -PhysicsManager.SKIN_WIDTH : PhysicsManager.SKIN_WIDTH);
    const rayEndX     = rayStartX + dx;

    let resultdx = dx;

    for (let y = sprite.y; y < sprite.y + sprite.height; y += PhysicsManager.RAY_SPACING) {
      const ray = new Ray(rayStartX, y, rayEndX, y);

      this.raycast(ray).then(hit => {
        resultdx = spriteSideX - hit.position.x;
      });
    }

    sprite.x += resultdx;
  }

  moveSpriteY(sprite: Sprite, dy: number): void {
    const spriteSideY = sprite.y + (dy > 0 ? sprite.height : 0);
    const rayStartY   = spriteSideY + (dy > 0 ? -PhysicsManager.SKIN_WIDTH : PhysicsManager.SKIN_WIDTH);
    const rayEndY     = rayStartY + dy;

    let resultdy = dy;

    for (let x = sprite.x; x < sprite.x + sprite.width; x += PhysicsManager.RAY_SPACING) {
      const ray = new Ray(x, rayStartY, x, rayEndY);

      this.raycast(ray).then(hit => {
        resultdy = hit.position.y - spriteSideY;
      });
    }

    sprite.y += resultdy;
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

    // TODO: could update var in a later version of TS.
    for (var sprite of this._sprites) { 
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