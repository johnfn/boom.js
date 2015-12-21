/**
 * An object made up of components.
 *
 * Note: Composite currently doesn't handle component inheritance...
 */
 class Composite {
   public static componentsForClasses: { [className: string]: Component<Composite>[] } = {};

   public components: Component<Composite>[] = [];

   constructor() {
     const componentsToAdd = Composite.componentsForClasses[Util.GetClassName(this)] || [];

     for (const c of componentsToAdd) {
       this.addComponent(c);
     }
   }

   public addComponent(comp: Component<Composite>): void {
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

     console.error(`couldn't find component of type ${type}`);

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

const component = function<T extends Composite>(comp: Component<Composite>): (target: any) => void {

  const renameFunction = function(name: any, fn: any): any {
    return (new Function('return function (call) { return function ' + name +
      ' () { return call(this, arguments) }; };')())(Function.apply.bind(fn));
  };


  return (constructor: any) => {
    const name = /^function\s+([\w\$]+)\s*\(/.exec(constructor.toString())[1];

    // Deal with component

    let comps  = Composite.componentsForClasses[name];
    if (!comps) { comps = Composite.componentsForClasses[name] = []; }
    comps.push(comp);


    // the new constructor behaviour

    const f: any = function(...args: any[]): any {
      const c: any = function(): void {
        return constructor.apply(this, args);
      }

      c.prototype = constructor.prototype;

      const obj = new c();
      obj._initializeComponents();
      if (obj.init) {
        obj.init();
      } else {
        console.log('consider adding init to ' + name + ' class.')
      }

      return obj;
    }

    // copy prototype so intanceof operator still works
    f.prototype = constructor.prototype;

    // return new constructor (will override original)
    return renameFunction(name, f);
  }
}