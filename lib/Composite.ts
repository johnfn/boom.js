/**
 * An object made up of components.
 *
 * Note: Composite currently doesn't handle component inheritance...
 */
 class Composite {
   public static componentsForClasses: { [className: string]: Component<Composite>[] } = {};

   public components: Component<Composite>[] = [];

   constructor() {
     let proto = Object.getPrototypeOf(this);

     // if (Util.GetClassName(this) === 'TransformWidget') { debugger; }

     while (proto !== null) {
       const componentsToAdd = Composite.componentsForClasses[Util.GetClassName(proto)] || [];

       for (const c of componentsToAdd) {
         this.addComponent(c);
       }

       proto = Object.getPrototypeOf(proto);
     }
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

     console.error(`couldn't find component of type ${type.name} on ${Util.GetClassName(this)}`);

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

// TODO - move this somewhere else...
function invokeConstructor<T>(Class: Constructable<T>, args: Array<any>): T {
  switch (args.length) {
    case 0: return new Class();
    case 1: return new Class(args[0]);
    case 2: return new Class(args[0], args[1]);
    case 3: return new Class(args[0], args[1], args[2]);
    case 4: return new Class(args[0], args[1], args[2], args[3]);
    case 5: return new Class(args[0], args[1], args[2], args[3], args[4]);
    case 6: return new Class(args[0], args[1], args[2], args[3], args[4], args[5]);
    case 7: return new Class(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    case 8: return new Class(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);

    default:
      throw new Error('Unsupported number of Constructor arguments');
  }
}

/**
 * Identifies an object which we can call `new` on.
 */
interface Constructable<T> {
  new (...args: any[]): T;
}

const component = function<T extends Composite>(comp: Component<Composite>): (target: any) => void {
  const renameFunction = function(name: any, fn: any): any {
    return (new Function('return function (call) { return function ' + name +
      ' () { return call(this, arguments) }; };')())(Function.apply.bind(fn));
  };


  return (constructor: any) => {
    const name = /^function\s+([\w\$]+)\s*\(/.exec(constructor.toString())[1];

    // Deal with component

    let comps = Composite.componentsForClasses[name];
    if (!comps) { comps = Composite.componentsForClasses[name] = []; }
    comps.push(comp);

    // the new constructor behaviour

    const f: any = function(...args: any[]): any {
      const obj: any = invokeConstructor(constructor, args)

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