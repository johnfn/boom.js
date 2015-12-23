interface ComponentInfo {
  component: Component<Composite>;
  hasInitialized: boolean;
}

/**
 * An object made up of components.
 */
 abstract class Composite {
   public static componentsForClasses: { [className: string]: Component<Composite>[] } = {};

   public static _destroyList: Composite[] = [];

   /**
    * Allow multiple components of this type? Defauls to false.
    */
   public allowMultiple = false;

   private _components: ComponentInfo[] = [];

   private _hash: string;

   private _destroyed: boolean;

   public get hash(): string {
     if (this._hash) { return this._hash; }
     return this._hash = '' + Math.random();
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

  /**
   * Destroys this sprite.
   */
   public destroy(): void {
     // I lied! This doesn't actually destroy the sprite. It just marks it for deletion.
     // Since updates are unordered, it's possible that a sprite that is yet to be
     // deleted this tick still refers to this sprite, and if we deleted it immediately
     // we would run into problems.

     if (this._destroyed) {
       console.error('Sprite destroyed multiple times. THIS IS REALLY BAD.')

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

    // Deal with component

    let comps = Composite.componentsForClasses[name];
    if (!comps) { comps = Composite.componentsForClasses[name] = []; }
    comps.push(comp);

    // the new constructor behaviour

    const f = function(...args: any[]): any {
      constructor.apply(this, args);

      this._initializeComponents();

      if (this.init) {
        this.init();
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