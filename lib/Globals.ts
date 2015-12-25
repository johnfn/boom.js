enum GlobalEvents {
  LoadingIsDone
}

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

  public static events = new Events<GlobalEvents>();

  private static _thingsThatAreLoading: number = 0;

  public static get thingsThatAreLoading(): number { return Globals._thingsThatAreLoading; }
  public static set thingsThatAreLoading(value: number) {
    Globals._thingsThatAreLoading = value;

    if (value === 0) {
      Globals.events.emit(GlobalEvents.LoadingIsDone);
    }
  }

  public static initialize(stage: Stage, fixedStage: Sprite): void {
    Globals.physicsManager = new PhysicsManager();
    Globals.keyboard       = new Keyboard();
    Globals.mouse          = new Mouse(stage);
    Globals.camera         = new Camera(stage);
    Globals.stage          = Globals.stage || stage;
    Globals.fixedStage     = Globals.fixedStage || fixedStage;

    Globals.camera.addLayer(Globals.stage, 1);
  }
}

class Composites {
  public static list = new Group<Composite>();

  private static _all: Composite[] = [];
  private static _cache: { [key: string]: Group<Composite> } = {};

  /**
   * Get all composites of a provided type.
   * @param type
   */
  public static all<T extends Composite>(type: { new (...args: any[]) : T } = Composite as any): Group<T> {
    const typeName = ('' + type).split('function ')[1].split('(')[0];

    if (typeName === 'Composite') {
      return Composites.list as Group<T>;
    }

    return Composites._cache[typeName] as Group<T>;
  }

  public static add<T extends Composite>(s: T): void {
    const typeName = Util.GetClassName(s);

    this.list.add(s);
    this._all.push(s);

    if (!Composites._cache[typeName]) {
      Composites._cache[typeName] = new Group<Composite>();
    }

    Composites._cache[typeName].add(s);
  }

  public static by(fn: (s: Composite) => boolean): Group<Composite> {
    const result: Composite[] = [];

    for (let i = 0; i < this._all.length; i++) {
      const item = this._all[i];

      if (fn(item)) { result.push(item); }
    }

    return new Group(result);
  }

  public static remove<T extends Composite>(s: T): void {
    const typeName = Util.GetClassName(s);

    this._all.splice(this._all.indexOf(s), 1);
    this.list.remove(s);

    Composites._cache[typeName].remove(s);
  }
}