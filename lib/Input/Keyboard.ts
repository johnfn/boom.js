class KeyInfo {
  [key: string]: boolean;

  public static keys: string[] =
  'QWERTYUIOPASDFGHJKLZXCVBNM'.split('')
    .concat('Spacebar')
    .concat('Up')
    .concat('Down')
    .concat('Left')
    .concat('Right');

  public W       : boolean;
  public A       : boolean;
  public S       : boolean;
  public D       : boolean;
  public Z       : boolean;
  public X       : boolean;
  public Up      : boolean;
  public Down    : boolean;
  public Left    : boolean;
  public Right   : boolean;
  public Spacebar: boolean;
}

interface QueuedKeyboardEvent {
  isDown: boolean;
  event : KeyboardEvent;
}

class Keyboard {
  public down     = new KeyInfo();
  public justDown = new KeyInfo();

  private _queuedEvents: QueuedKeyboardEvent[] = [];

  constructor() {
    addEventListener('keydown', e => this.keyDown(e), false);
    addEventListener('keyup',   e => this.keyUp(e),   false);
  }

  public update(): void {
    for (const key of KeyInfo.keys) {
      this.justDown[key] = false;
    }

    for (const queuedEvent of this._queuedEvents) {
      const key = this.eventToKey(queuedEvent.event);

      if (queuedEvent.isDown) {
        if (!this.down[key]) {
          this.justDown[key] = true;
        }

        this.down[key]     = true;
      } else {
        this.down[key]     = false;
      }
    }

    this._queuedEvents = [];
  }

  private keyUp(e: KeyboardEvent): void {
    // Since events happen asynchronously, we simply queue them up
    // to be processed on the next update cycle.

    this._queuedEvents.push({ event: e, isDown: false });
  }

  private keyDown(e: KeyboardEvent): void {
    this._queuedEvents.push({ event: e, isDown: true });
  }

  private eventToKey(event: KeyboardEvent): string {
    const code = event.keyCode || event.which;
    let str: string;

    switch (code) {
      case 37: str = 'Left'; break;
      case 38: str = 'Up'; break;
      case 39: str = 'Right'; break;
      case 40: str = 'Down'; break;

      /* A-Z */
      default: str = String.fromCharCode(code);
    }

    if (str === ' ') {
      return 'Spacebar';
    }

    if (str.length === 1) {
      return str.toUpperCase();
    }

    return Util.ToTitleCase(str);
  }
}
