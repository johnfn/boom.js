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
  return (target: any) => { // TODO: Idk how to type this!
    const name = /^function\s+([\w\$]+)\s*\(/.exec(target.toString())[1];
    let comps  = Composite.componentsForClasses[name];

    if (!comps) { comps = Composite.componentsForClasses[name] = []; }

    comps.push(comp);
  }
}