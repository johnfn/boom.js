/// <reference path="./datastructures.d.ts"/>

class Sprite {
  /**
    Allow traversal of our own keys. Useful for metaprogramming.
  */
  [key: string]: any;

  /**
   * The first part of this sprite's name.
   */
  public baseName: string;

  /**
    Name for this sprite. Only used for debugging.
  */
  public get name(): string { return `${this.baseName} (${this._objectNumber})`; }

  public events = new Events<SpriteEvents>();

  /**
    PIXI-backed Display Object for this Sprite.
  */
  public displayObject: PIXI.Sprite;

  /**
    Whether this Sprite will show up in the Inspector.
  */
  public inspectable: boolean = true;

  /**
   * This just maps sprite names to number of that type of sprite that we have
   * seen. Only really used for _derivedObjectCount.
   */
  private static _derivedObjectCount: { [key: string]: number; } = {};

  /**
   * This is the _objectNumber-th Sprite-subclass created.
   */
  private _objectNumber: number;

  public texture: PIXI.Texture;

  protected _z: number;

  public components: Component[];

  physics: PhysicsComponent;

  /**
   * Debug draw object. Useful to draw lines and shapes for debugging.
   */
  public debug: DebugDraw;

  public get textureUrl(): string {
    return this.texture.baseTexture.imageUrl;
  }

  public static defaultInspectableProperties = ["x", "y", "width", "height", "rotation", "alpha"];

  public static inspectableProperties: { [key: string]: string[]; } = {};
  get inspectableProperties(): string[] {
    var className = Util.GetClassName(this);

    Sprite.inspectableProperties[className] = Sprite.inspectableProperties[className] || Sprite.defaultInspectableProperties.slice(0);
    return Sprite.inspectableProperties[className];
  }

  public addInspectableProperty(className: string, propName: string) {
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
  set x(val: number) { this.displayObject.position.x = val; }

  get y(): number { return this.displayObject.y; }
  set y(val: number) { this.displayObject.y = val; }

  get parent(): Sprite {
    if (this.displayObject.parent) {
      return Stage.doToSprite.get(this.displayObject.parent);
    } else {
      return null;
    }
  }

  get stage(): Stage {
    let sprite = this;

    // If we keep going up, we'll either hit the Stage, or we're an orphaned 
    // Sprite. 

    while (sprite.parent != null) {
      sprite = sprite.parent;
    }

    if (sprite instanceof Stage) {
      return sprite;
    } else {
      return null;
    }
  }

  /**
    Position of this sprite relative to its parent.
  */
  get position(): Point {
    return new Point(this.displayObject.position.x, this.displayObject.position.y);
  }

  /**
    Position of this sprite relative to the world.
  */
  get absolutePosition(): Point {
    if (this.parent == null) {
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

  get alpha(): number { return this.displayObject.alpha; }
  set alpha(val: number) { this.displayObject.alpha = val; }

  get visible(): boolean { return this.displayObject.visible; }
  set visible(val: boolean) { this.displayObject.visible = val; }

  get bounds(): PIXI.Rectangle { return this.displayObject.getBounds(); }

  public get children() {
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

  /**
   * In the case where Sprites are created before the Stage is created, we enqueue them here
   * so we can add them to the Stage when it is finally created.
   */
  private static enqueuedSprites = new MagicArray<Sprite>();

  constructor(components: Component[] = [], texture: PIXI.Texture | string = null) {
    let className = Util.GetClassName(this);

    if (!this.baseName) this.baseName = Util.GetClassName(this);

    this._objectNumber = Sprite._derivedObjectCount[className] = (Sprite._derivedObjectCount[className] || 0) + 1;

    if (texture instanceof PIXI.Texture) {
      this.texture = texture;
    } else if (typeof texture === "string") {
      this.texture = PIXI.Texture.fromImage(texture);
    } else if (texture === null) {
      this.texture = PIXI.Texture.EMPTY;
    }

    this.displayObject = new PIXI.Sprite(this.texture);
    Stage.doToSprite.put(this.displayObject, this);

    this.x = 0;
    this.y = 0;

    let _graphics = this.displayObject.addChild(new PIXI.Graphics()) as PIXI.Graphics;
    this.displayObject.interactive = true;
    _graphics.interactive = true;

    this.initComponents(components.concat([
      new DebugDraw(this, _graphics)
    ]));
  }

  private initComponents(components: Component[]): void {
    for (const c of components) {
      // Make easy-to-access references to common components.
      if (c instanceof PhysicsComponent) this.physics = c;
      if (c instanceof DebugDraw)        this.debug = c;

      c.init(this);
    }

    this.components = components;
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

  public addChild<T extends Sprite>(child: T): T {
    this.displayObject.addChild(child.displayObject);
    this.sortDepths();

    this.events.emit(SpriteEvents.AddChild, child);
    child.events.emit(SpriteEvents.ChangeParent, this);

    return child;
  }

  public removeChild(child: Sprite) {
    this.displayObject.removeChild(child.displayObject);
  }

  public clone(): Sprite {
    var newSprite = new Sprite([], this.texture);

    return newSprite;
  }

  public update() {
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
  
  public findTopmostSpriteAt(point: PIXI.Point, interactable: boolean): Sprite {
    var sprites = this.getAllSprites();

    return sprites.find(o => {
      if (interactable && !o.inspectable) return;

      return point.x >= o.absolutePosition.x && point.x <= o.absolutePosition.x + o.width &&
             point.y >= o.absolutePosition.y && point.y <= o.absolutePosition.y + o.height;
    });
  }
}
