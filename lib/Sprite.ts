/// <reference path="./datastructures.d.ts"/>
/// <reference path="./Mixins/DebugDraw.ts"/>
/// <reference path="./lib.d.ts"/>

enum SpriteEvents {
  AddChild,
  MouseDown,
  MouseUp,
  MouseMove,

  /**
   * Sprite changes position.
   */
  Move,

  /**
   * Sprite changes parent.
   */
  ChangeParent
}

@component(new DebugDraw())
@component(new TweenComponent())
@component(new Events<SpriteEvents>())
class Sprite extends Composite {
  /**
   * Allow traversal of our own keys. Useful for metaprogramming.
   */
  [key: string]: any;

  /**
   * Maps DisplayObjects to Sprites associated to those DisplayObjects.
   */
  public static doToSprite = new MagicDict<PIXI.DisplayObject, Sprite>();

  public static defaultInspectableProperties = ['x', 'y', 'width', 'height', 'rotation', 'alpha'];

  /**
   * Mapping of class names to inspectable properties of that class.
   *
   * TODO: Should probably make a whole property type so that this seems less
   * odd.
   */
  public static inspectableProperties: { [key: string]: string[]; } = {};

  /**
   * This just maps sprite names to number of that type of sprite that we have
   * seen. Only really used for name.
   */
  private static _derivedObjectCount: { [key: string]: number; } = {};

  //
  //          COMPONENTS
  //

  /**
   * Physics component. Used for collisions and movement.
   *
   * @type {PhysicsComponent}
   */
  public physics: PhysicsComponent;

  /**
   * Debug draw component. Used to draw rays, lines etc for debugging.
   */
  public debug: DebugDraw;

  /**
   * Tween component. Useful for animations.
   */
  public tween: TweenComponent;

  /**
   * Events component. Useful for listening and reacting to changes in the Sprite.
   */
  public events: Events<SpriteEvents>;

  /**
   * The first part of this sprite's name.
   */
  public baseName: string;

  /**
   * Name for this sprite. Only used for debugging.
   */
  public get name(): string { return `${this.baseName} (${this._objectNumber})`; }

  /**
   * PIXI-backed Display Object for this Sprite.
   */
  public displayObject: PIXI.Sprite;

  /**
   * Whether this Sprite will show up in the Inspector.
   */
  public inspectable: boolean = true;

  public texture: PIXI.Texture;

  public tags: string[] = [];

  private _z: number = 0;

  /**
   * This is the _objectNumber-th Sprite-subclass created.
   */
  private _objectNumber: number;

  private _globalXYCache: Point = undefined;

  public get textureUrl(): string {
    return this.texture.baseTexture.imageUrl;
  }

  get inspectableProperties(): string[] {
    const className = Util.GetClassName(this);

    Sprite.inspectableProperties[className] = Sprite.inspectableProperties[className] || Sprite.defaultInspectableProperties.slice(0);
    return Sprite.inspectableProperties[className];
  }

  public addInspectableProperty(className: string, propName: string): void {
    Sprite.inspectableProperties[className] = Sprite.inspectableProperties[className] || Sprite.defaultInspectableProperties.slice(0);
    Sprite.inspectableProperties[className].push(propName);
  }

  /**
   * Z-ordering. Higher numbers are on top of lower numbers.
   */
  get z(): number { return this._z; }
  set z(val: number) {
    this._z = val;

    if (this.parent) {
      this.parent.sortDepths();
    }
  }

  get x(): number { return this.displayObject.position.x; }
  set x(val: number) {
    this.displayObject.position.x = val;

    this.events.emit(SpriteEvents.Move);
  }

  get y(): number { return this.displayObject.y; }
  set y(val: number) {
    this.displayObject.y = val;

    this.events.emit(SpriteEvents.Move);
  }

  get parent(): Sprite {
    if (this.displayObject.parent) {
      return Stage.doToSprite.get(this.displayObject.parent);
    } else {
      return undefined;
    }
  }

  /**
   * Position of this sprite relative to its parent.
   */
  get position(): Point {
    return new Point(this.displayObject.position.x, this.displayObject.position.y);
  }

  /**
   * Position of this sprite relative to the world.
   */
  get absolutePosition(): Point {
    if (this.parent === undefined) {
      return this.position;
    }

    let result = this.position.add(this.parent.absolutePosition);

    return result;
  }

  get width(): number { return this.displayObject.width; }
  set width(val: number) { this.displayObject.width = val; }

  get height(): number { return this.displayObject.height; }
  set height(val: number) { this.displayObject.height = val; }

  get rotation(): number { return this.displayObject.rotation; }
  set rotation(val: number) { this.displayObject.rotation = val; }

  get scale(): PIXI.Point { return this.displayObject.scale; }
  set scale(val: PIXI.Point) { this.displayObject.scale = val; }

  get alpha(): number { return this.displayObject.alpha; }
  set alpha(val: number) { this.displayObject.alpha = val; }

  get visible(): boolean { return this.displayObject.visible; }
  set visible(val: boolean) { this.displayObject.visible = val; }

  /**
   * Bounding rectangle for this Sprite.
   *
   * TODO: This should really be a Vector or something, as the x, y properties are unused.
   * @returns {}
   */
  get bounds(): PIXI.Rectangle { return this.displayObject.getBounds(); }

  /**
   * Rectangle for this sprite (x, y, width and height of Sprite).
   *
   * @returns {}
   */
  get rect(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
  }

  /**
   * Get the screen-space x and y coordinates of this object (not relative to anything).
   * @returns {}
   */
  get globalXY(): Point {
    if (!this.parent) {
      return this.position;
    }

    if (!this._globalXYCache) {
      this._globalXYCache = new Point(this.x + this.parent.globalXY.x,
                                      this.y + this.parent.globalXY.y);
    }

    return this._globalXYCache;
  }

  get globalX(): number {
    return this.globalXY.x
  }

  get globalY(): number {
    return this.globalXY.y
  }

  /**
   * Get bounds of this Sprite in terms of global coordinates.
   * @returns {}
   */
  get globalBounds(): PIXI.Rectangle {
    const globalxy = this.globalXY
    const bounds = this.bounds

    return new PIXI.Rectangle(globalxy.x, globalxy.y, bounds.width, bounds.height);
  }

  /**
   * Gets all children of this Sprite.
   * @returns {}
   */
  public get children(): MagicArray<Sprite> {
    return new MagicArray(this.displayObject.children)
      // The reason we filter by .contains here is because the children of displayObject
      // could be things that are not official Sprites. A good example is PIXI.Graphics
      // objects.
      .filter(d => Stage.doToSprite.contains(d))
      .map(d => Stage.doToSprite.get(d));
  }

  public get totalNumSubChildren(): number {
    return 1 + Util.Sum(this.children.map(o => o.totalNumSubChildren));
  }

  constructor(texture: PIXI.Texture | string = undefined) {
    super();

    const className = Util.GetClassName(this);

    if (!this.baseName) { this.baseName = Util.GetClassName(this); }

    this._objectNumber = Sprite._derivedObjectCount[className] = (Sprite._derivedObjectCount[className] || 0) + 1;

    if (texture instanceof PIXI.Texture) {
      this.texture = texture;
    } else if (typeof texture === 'string') {
      this.texture = PIXI.Texture.fromImage(texture);
    } else if (texture === undefined) {
      this.texture = PIXI.Texture.EMPTY;
    }

    this.displayObject = new PIXI.Sprite(this.texture);

    Stage.doToSprite.put(this.displayObject, this);

    this._setUpEvents();

    // Make easy-to-access references to common components.

    if (this.hasComponent(PhysicsComponent)) { this.physics = this.getComponent(PhysicsComponent); }
    if (this.hasComponent(TweenComponent))   { this.tween   = this.getComponent(TweenComponent);   }
    if (this.hasComponent(Events))           { this.events  = this.getComponent(Events);           }
  }

  public init(): void {
    this.x = 0;
    this.y = 0;
  }

  public moveTo(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Sets z for those of us who like chainable interfaces. Higher numbers are on top
   * of lower numbers.
   *
   * @param z
   */
  public setZ(z: number): this {
    this.z = z;

    return this;
  }

  public setDimensions(width: number, height: number): this {
    this.width = width;
    this.height = height;

    return this;
  }

  public addTo(sprite: Sprite): this {
    sprite.addChild(this);

    return this;
  }

  /**
   * Adds a child to this Sprite
   *
   * TODO: returning the child seems incorrect here.
   *
   * @param child
   */
  public addChild<T extends Sprite>(child: T): T {
    this.displayObject.addChild(child.displayObject);
    this.sortDepths();

    this.events.emit(SpriteEvents.AddChild, child);
    child.events.emit(SpriteEvents.ChangeParent, this);

    return child;
  }

  /**
   * Adds a display object to this Sprite. You probably should never
   * have to use this method.
   */
  public _addDO(child: PIXI.DisplayObject): this {
    this.displayObject.addChild(child);

    return this;
  }

  public removeChild(child: Sprite): void {
    this.displayObject.removeChild(child.displayObject);
  }

  public clone(): Sprite {
    return new Sprite(this.texture);
  }

  public update(): void {
    this._globalXYCache = undefined;
  }

  /**
   * Get every sprite that is nested under this sprite.
   */
  public getAllSprites(): MagicArray<Sprite> {
    let result = new MagicArray<Sprite>();

    for (let child of this.children) {
      for (let sub of this.getAllSpritesHelper(child)) {
        result.push(sub);
      }
    }

    return result;
  }

  public findTopmostSpriteAt(point: PIXI.Point, interactable: boolean): Sprite {
    return this.getAllSprites().filter(o => {
      if (interactable && !o.inspectable) { return false; }

      return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
             point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
    }).max(o => o.z);
  }

  public findSpritesAt(point: Point): MagicArray<Sprite> {
    return this.getAllSprites().filter(o => {
      return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
             point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
    });
  }

  public contains(p: Point): boolean {
    return Util.RectPointIntersection(this.bounds, p);
  }

  public _actuallyDestroy(): void {
    super._actuallyDestroy();

    this.parent.displayObject.removeChild(this.displayObject);

    this.displayObject = undefined;
    this.events        = undefined;
  }

  private _setUpEvents(): void {
    this.displayObject.interactive = true;

    this.displayObject.on('mousedown', (e: PIXI.interaction.InteractionEvent) => this.events.emit(SpriteEvents.MouseDown, e), this);
    this.displayObject.on('mousemove', (e: PIXI.interaction.InteractionEvent) => this.events.emit(SpriteEvents.MouseMove, e), this);
    this.displayObject.on('mouseup',   (e: PIXI.interaction.InteractionEvent) => this.events.emit(SpriteEvents.MouseUp, e), this);
  }

  private sortDepths(): void {
    this.displayObject.children.sort((a, b) => {
      /*
        Our children are either other Sprites, or PIXI.Graphics.
        PIXI.Graphics won't have a z index, so we just put them as high as
        possible.
      */

      let spriteForA = Stage.doToSprite.get(a);
      let spriteForB = Stage.doToSprite.get(b);

      let aZ = spriteForA ? spriteForA.z : Number.POSITIVE_INFINITY;
      let bZ = spriteForB ? spriteForB.z : Number.POSITIVE_INFINITY;

      return aZ - bZ;
    });
  }

  private getAllSpritesHelper(root: Sprite): MagicArray<Sprite> {
    let result = new MagicArray<Sprite>();

    result.push(root);

    for (let child of root.children) {
      let innerSprites = this.getAllSpritesHelper(child);

      for (let inner of innerSprites) {
        result.push(inner);
      }
    }

    return result;
  }
}