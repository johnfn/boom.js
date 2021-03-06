interface ComponentInfo {
  component: Component<Composite>;
  hasInitialized: boolean;
}

abstract class Composite {
  public static componentsForClasses: { [className: string]: Component<Composite>[] } = {};

  public static _destroyList: Composite[] = [];

   /**
    * Allow multiple components of this type? Defauls to false.
    */
    public allowMultiple = false;

    public hasCalledInit = false;

    private _components: ComponentInfo[] = [];

    private _hash: string;

    private _destroyed: boolean;

    public get hash(): string {
      if (this._hash) { return this._hash; }
      return this._hash = '' + Math.random();
    }

    public static registerComponentForClass(comp: Component<Composite>, name: string): void {
      let comps = Composite.componentsForClasses[name];

      if (!comps) { comps = Composite.componentsForClasses[name] = []; }
      comps.push(comp);
    }

    constructor() {
      let proto = Object.getPrototypeOf(this);

      while (proto !== null) {
        const componentsToAdd = Composite.componentsForClasses[Util.GetClassName(proto)] || [];

        for (const c of componentsToAdd) {
          this.addComponent(c);
        }

        proto = Object.getPrototypeOf(proto);
      }

      Composites.add(this);
    }

    public preUpdate(): void { }

    public update(): void { }

    public postUpdate(): void { }

    public init(): void { }

  /**
   * Destroys this composite.
   */
  public destroy(): void {
    // I lied! This doesn't actually destroy the composite. It just marks it for deletion.
    // Since updates are unordered, it's possible that a composite that is yet to be
    // deleted this tick still refers to this composite, and if we deleted it immediately
    // we would run into problems.

    if (this._destroyed) {
      console.error('Composite destroyed multiple times. This is probably unintentional.')

      return;
    }

    Composite._destroyList.push(this);
    this._destroyed = true;
  }

   /**
    * Immediately destroys this composite, purging all the memory it used.
    * If you want to destroy a Composite, it's strongly recommended to use
    * destroy() instead, which will defer a call _actuallyDestroy.
    */
   public _actuallyDestroy(): void { }

   public addComponent(comp: Component<Composite>): void {
     if (!this.allowMultiple && this.hasComponent(comp.constructor as any)) {
       console.error('Trying to add 2 components of the same type.')

       debugger;

       return;
     }

     const c = Util.Clone(comp);

     this._components.push({ component: c, hasInitialized: false });
     c.setTarget(this);
   }

   public getComponent<T>(type: { new (...args: any[]): T } ): T {
     for (const comp of this.getComponents()) {
       if (comp instanceof type) {
         return (comp as any) as T;
       }
     }

     console.error(`couldn't find component of type ${(type as any).name} on ${Util.GetClassName(this)}`);

     return undefined;
   }

   public getComponents(): Component<Composite>[] {
     const result: Component<Composite>[] = [];

     for (const comp of this._components) {
       result.push(comp.component);
     }

     return result;
   }

   public hasComponent<T>(type: { new (...args: any[]): T } ): boolean {
     for (const comp of this.getComponents()) {
       if (comp instanceof type) {
         return true;
       }
     }

     return false;
   }

  /**
   * This method is called for you. There should be no reason for
   * you to need to call it.
   */
  public _initializeComponents(): void {
    // Add each component as a property on the composite (if it has a specified propName)

    for (const c of this._components) {
      if (c.hasInitialized) { continue; }

      const comp = c.component;
      const propName = comp.getPropName();

      if (propName === '') {
        continue;
      }

      if ((comp.getComposite() as any)[propName] !== undefined) {
        console.log(`tried to set ${Util.GetClassName(comp.getComposite())}.${propName}, but it was already set...`);

        continue;
      }

      (comp.getComposite() as any)[propName] = comp;
    }

    for (const comp of this._components) {
      if (comp.hasInitialized) { continue; }

      comp.component.setTarget(this);
      comp.component.init();
      comp.hasInitialized = true;
    }
  }
}

interface Constructable< T > {
  new (...args: any[]): T;
}

const component = function<T extends Composite>(comp: Component<T>): any {
  const renameFunction = function(name: any, fn: any): any {
    return (new Function('return function (call) { return function ' + name +
      ' () { return call(this, arguments) }; };')())(Function.apply.bind(fn));
    };

    return function(constructor: Constructable<Composite>): any {
      const name = (constructor as any).name || /^function\s+([\w\$]+)\s*\(/.exec(constructor.toString())[1];

      Composite.registerComponentForClass(comp, name);

      // the new constructor behaviour

      const f = function(...args: any[]): any {
        constructor.apply(this, args);

        this._initializeComponents();

        if (this.init) {
          if (!this.hasCalledInit) {
            this.init();
            this.hasCalledInit = true;
          }
        } else {
          console.log('consider adding init to ' + name + ' class.')
        }
      }

      const renamed = renameFunction(name, f);

      // copy prototype so intanceof operator still works
      renamed.prototype = constructor.prototype;

      // Copy over static properties (except the ones we already have)
      const skippedProps = Object.getOwnPropertyNames(Function);

      for (const propName of Object.getOwnPropertyNames(constructor)) {
        if (skippedProps.indexOf(propName) !== -1) { continue; }

        renamed[propName] = (constructor as any)[propName];
      }

      // return new constructor (will override original)
      return renamed;
    }
  }