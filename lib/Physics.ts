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

interface ResolveVelocityResult {
  newVelocity: number;
  collision: boolean;
}

class PhysicsManager {
  private _sprites = new MagicArray<Sprite>();

  private static SKIN_WIDTH = 1;
  private static RAY_SPACING = 8;

  constructor() {
    
  }

  private moveSpriteX(sprite: Sprite, dx: number): ResolveVelocityResult {
    const spriteSideX = sprite.x + (dx > 0 ? sprite.width : 0);
    const rayStartX   = spriteSideX + (dx > 0 ? -PhysicsManager.SKIN_WIDTH : PhysicsManager.SKIN_WIDTH);
    const rayEndX     = rayStartX + dx;

    let result = {
      newVelocity: dx,
      collision  : false
    }

    for (let y = sprite.y; y < sprite.y + sprite.height; y += PhysicsManager.RAY_SPACING) {
      const ray = new Ray(rayStartX, y, rayEndX, y);

      this.raycast(ray, sprite.physics.collidesWith).then(hit => {
        const newVelocity = spriteSideX - hit.position.x;

        if (!result.collision || newVelocity < result.newVelocity) {
          result = {
            collision: true,
            newVelocity
          };
        }
      });
    }

    return result;
  }

  private moveSpriteY(sprite: Sprite, dy: number): ResolveVelocityResult {
    const spriteSideY = sprite.y + (dy > 0 ? sprite.height : 0);
    const rayStartY   = spriteSideY + (dy > 0 ? -PhysicsManager.SKIN_WIDTH : PhysicsManager.SKIN_WIDTH);
    const rayEndY     = rayStartY + dy;

    let result = {
      newVelocity: dy,
      collision  : false
    }

    for (let x = sprite.x; x < sprite.x + sprite.width; x += PhysicsManager.RAY_SPACING) {
      const ray = new Ray(x, rayStartY, x, rayEndY);

      this.raycast(ray, sprite.physics.collidesWith).then(hit => {
        const newVelocity = hit.position.y - spriteSideY;

        if (!result.collision || newVelocity < result.newVelocity) {
          result = {
            collision: true,
            newVelocity
          };
        }
      });
    }

    return result;
  }

  private moveSprite(sprite: Sprite, dx: number, dy: number): void {
    if (dx != 0) {
      const result = this.moveSpriteX(sprite, dx);

      sprite.x += result.newVelocity;

      if (result.collision) {
        sprite.physics.touchingLeft  = dx < 0;
        sprite.physics.touchingRight = dx > 0;
      }
    }

    if (dy != 0) {
      const result = this.moveSpriteY(sprite, dy);

      sprite.y += result.newVelocity;

      if (result.collision) {
        sprite.physics.touchingTop    = dy < 0;
        sprite.physics.touchingBottom = dy > 0;
      }
    }
  }

  update(): void {
    // move all sprites

    for (const sprite of this._sprites) {
      sprite.physics.resetFlags();
    }

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

  remove(sprite: Sprite): void {
    const index = this._sprites.indexOf(sprite);

    if (index !== -1) {
      this._sprites.splice(index, 1);
    }
  }

  /**
   * Raycasts from a given ray, returning the first sprite that the ray intersects.
   * Ignores any sprite that the start of the ray is already colliding with.
   * 
   * @param ray 
   * @returns {} 
   */
  raycast(ray: Ray, against: Group<Sprite>): Maybe<RaycastResult> {
    // TODO could (should) use a quadtree or something

    if (!against) return new Maybe<RaycastResult>();

    const againstList = against.all();
    let result: RaycastResult = undefined;

    // TODO: could update var in a later version of TS.
    for (var sprite of againstList) { 
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

class PhysicsComponent extends Component<Sprite> {
  public dx: number = 0;
  public dy: number = 0;

  public touchingBottom : boolean = false;
  public touchingTop    : boolean = false;
  public touchingRight  : boolean = false;
  public touchingLeft   : boolean = false;

  public solid    : boolean;
  public immovable: boolean;

  public collidesWith : Group<Sprite>;

  constructor(physics: Physics) {
    super();

    this.solid        = physics.solid;
    this.immovable    = physics.immovable;
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
   */
  reset(): void {
    this.dx = 0;
    this.dy = 0;
  }

  resetFlags(): void {
    this.touchingBottom = false;
    this.touchingTop    = false;
    this.touchingLeft   = false;
    this.touchingRight  = false;
  }

  postUpdate(): void { }
  preUpdate() : void { }
  update()    : void { }
  
  destroy(): void {
    Globals.physicsManager.remove(this._sprite);
  }
}