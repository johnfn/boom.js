interface ComponentInfo<T extends Composite> {
  component  : Component<T>;
  initialized: boolean;
};

/**
 * An object made up of components.
 *
 * Note: Composite currently doesn't handle component inheritance...
 */
 class Composite {
   public static componentsForClasses: { [className: string]: Component<Composite>[] } = {};

   public components: ComponentInfo<Composite>[] = [];

   constructor() {
     const componentsToAdd = Composite.componentsForClasses[Util.GetClassName(this)] || [];

     for (const c of componentsToAdd) {
       this.addComponent(c);
     }
   }

   public addComponent(comp: Component<Composite>): void {
     const clone = Util.Clone(comp);

     this.components.push({
       component  : clone,
       initialized: false,
     });

     clone.setTarget(this);
   }

   public getComponent<T>(type: { new (...args: any[]): T } ): T {
     for (const comp of this.components) {
       if (comp.component instanceof type) {
         return (comp.component as any) as T;
       }
     }

     console.error(`couldn't find component of type ${type}`);

     return undefined;
  }

  public hasComponent<T>(type: { new (...args: any[]): T } ): boolean {
    for (const comp of this.components) {
      if (comp.component instanceof type) {
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
      if (!comp.initialized) {
        comp.component.init();
      }
    }
  }
}

const component = function<T extends Composite>(comp: Component<Composite>): (target: any) => void {
  /*
  return (cons: any) => { // TODO: Idk how to type this!
    return cons;
  }
  */

  const renameFunction = function(name: any, fn: any): any {
    const f = eval('function ' + name + '(){};' + name);
    f.prototype = fn;
    return new f();
  };


  return (constructor: any) => {
    const name = /^function\s+([\w\$]+)\s*\(/.exec(constructor.toString())[1];

    // Deal with component
    let comps  = Composite.componentsForClasses[name];
    if (!comps) { comps = Composite.componentsForClasses[name] = []; }
    comps.push(comp);

    let f: any = function(...args: any[]): any {
      const c: any = function(): void {
        return constructor.apply(this, args);
      }

      c.prototype = constructor.prototype;

      const obj = new c();

      obj._initializeComponents();

      return obj;
    }

    f = renameFunction(name, f);

    // copy prototype so intanceof operator still works
    f.prototype = constructor.prototype;

    const names = Object.getOwnPropertyNames(constructor).slice(5)

    for (const propname of names) {
      if (constructor.hasOwnProperty(propname)) {
        f[propname] = constructor[propname];
      }
    }

    // return new constructor (will override original)
    return f;
  }
}