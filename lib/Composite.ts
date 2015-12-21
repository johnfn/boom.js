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
}

const component = function<T extends Composite>(comp: Component<Composite>): (target: any) => void {
  /*
  return (cons: any) => { // TODO: Idk how to type this!
    return cons;
  }
  */

  const renameFunction = function(name: any, fn: any): any {
    return (new Function('return function (call) { return function ' + name +
      ' () { return call(this, arguments) }; };')())(Function.apply.bind(fn));
  };


  return (target: any) => {
    const name = /^function\s+([\w\$]+)\s*\(/.exec(target.toString())[1];

    // save a reference to the original constructor
    const original = target;

    // a utility function to generate instances of a class
    function construct(constructor: any, args: any): any {
      const c: any = function(): void {
        return constructor.apply(this, args);
      }

      c.prototype = constructor.prototype;
      return new c();
    }

    // the new constructor behaviour
    const f: any = function(...args: any[]): any {
      let comps  = Composite.componentsForClasses[name];

      if (!comps) { comps = Composite.componentsForClasses[name] = []; }

      comps.push(comp);

      console.log('New: ' + original.name);

      const newObj = construct(original, args);

      return newObj;
    }

    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    // return new constructor (will override original)
    return renameFunction(name, f);
  }
}