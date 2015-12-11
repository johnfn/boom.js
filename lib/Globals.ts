

class Globals {
  public static physicsManager: PhysicsManager;
  /**
   * Reference to the first stage created.
   */
  public static stage: Stage;

  public static fixedStage: Sprite;

  public static keyboard: Keyboard;

  public static mouse: Mouse;

  /**
   * Reference to the currently active camera.
   */
  public static camera: Camera;

  public static initialize(stage: Stage, fixedStage: Sprite) {
    Globals.physicsManager = new PhysicsManager();
    Globals.keyboard       = new Keyboard();
    Globals.mouse          = new Mouse(stage);
    Globals.camera         = new Camera(stage);
    Globals.stage          = Globals.stage || stage;
    Globals.fixedStage     = Globals.fixedStage || fixedStage;
  }

  public static _destroyList: Sprite[] = [];
}

class Sprites {
  public static list = new Group<Sprite>();

  public static all<T extends Sprite>(type: { new (...args: any[]) : T } = Sprite as any): Group<T> {
    const typeName = ("" + type).split("function ")[1].split("(")[0];

    if (typeName === "Sprite") {
      return Sprites.list as Group<T>;
    }

    const sprites  = Sprites.list.all();
    const result   = new Group<T>();

    for (const s of sprites) {
      const name = Util.GetClassName(s);

      if (Util.GetClassName(s) === typeName) {
        result.add(s as T);
      }
    }

    return result;
  }

  public static add<T extends Sprite>(s: T): void {
    this.list.add(s);
  }

  public static remove<T extends Sprite>(s: T): void {
    this.list.remove(s);
  }
}