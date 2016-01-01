import { MagicArray, MagicDict } from '../DataStructures.ts'
import { Composite, Component } from '../Core.ts'

debugger;

interface HasEvents<T> { events: Events<T> }

type EventCB = (...args: any[]) => void;

export enum MetaEvents {
  AddFirstEvent
}

export class Events<T> extends Component<Composite> {
  public metaEvents: Events<MetaEvents> = undefined;

  private _events    = new MagicDict<T, MagicArray<EventCB>>(() => new MagicArray<EventCB>());
  private _numEvents = 0;

  constructor(dispatchMetaEvents = false) {
    super('events');

    if (dispatchMetaEvents) {
      this.metaEvents = new Events<MetaEvents>();
    }
  }

  public emit(event: T, ...args: any[]): void {
    for (const cb of this._events.get(event)) {
      cb(...args)
    }
  }

  public on(event: T, cb: EventCB): void {
    this._events.get(event).push(cb);

    if (this.metaEvents !== undefined && ++this._numEvents === 1) {
      this.metaEvents.emit(MetaEvents.AddFirstEvent);
    }
  }

  public off(event: T, cb: EventCB): void {
    const updated = this._events.get(event).remove(cb);

    this._events.put(event, updated);
  }
}
