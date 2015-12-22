/**
 * An object made up of components.
 */
 abstract class Composite {
   public static componentsForClasses: { [className: string]: Component<Composite>[] } = {};

   public components: Component<Composite>[] = [];

   private _hash: string;

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

   public addComponent(comp: Component<Composite>): void {
     if (this.hasComponent(comp.constructor as any)) {
       console.error('Trying to add 2 components of the same type.')

       debugger;

       return;
     }

     const c = Util.Clone(comp);

     this.components.push(c);
     c.setTarget(this);
   }

   public getComponent<T>(type: { new (...args: any[]): T } ): T {
     for (const comp of this.components) {
       if (comp instanceof type) {
         return (comp as any) as T;
       }
     }

     console.error(`couldn't find component of type ${(type as any).name} on ${Util.GetClassName(this)}`);

     return undefined;
  }

  public hasComponent<T>(type: { new (...args: any[]): T } ): boolean {
    for (const comp of this.components) {
      if (comp instanceof type) {
        return true;
      }
    }

    return false;
  }


  public preUpdate(): void { }

  public update(): void { }

  public postUpdate(): void { }

  /**
   * This method is called for you. There should be no reason for
   * you to need to call it.
   */
  public _initializeComponents(): void {
    for (const comp of this.components) {
      comp.setTarget(this);
      comp.init();
    }
  }
}

const component = function<T extends Composite>(comp: Component<Composite>): any {
  const renameFunction = function(name: any, fn: any): any {
    return (new Function('return function (call) { return function ' + name +
      ' () { return call(this, arguments) }; };')())(Function.apply.bind(fn));
  };

  return function(constructor: any): any {
    const name = constructor.name || /^function\s+([\w\$]+)\s*\(/.exec(constructor.toString())[1];

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

      renamed[propName] = constructor[propName];
    }

    // return new constructor (will override original)
    return renamed;
  }
}