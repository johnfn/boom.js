class KeyInfo {
  [key: string]: boolean;

  static Keys: string[] = "qwertyuiopasdfghjklzxcvbnm".split("");

  W: boolean;
  A: boolean;
  S: boolean;
  D: boolean;
}

class Keyboard {
  public down = new KeyInfo();
  public justDown = new KeyInfo();

  constructor() {
    addEventListener("keydown", e => this.keyDown(e), false);
    addEventListener("keyup", e => this.keyUp(e), false);
  }

  keyUp(e: KeyboardEvent) {
    if (KeyInfo.Keys.indexOf(e.key) !== -1) {
      this.down[e.key.toUpperCase()] = false;
    }
  }

  keyDown(e: KeyboardEvent) {
    if (KeyInfo.Keys.indexOf(e.key) !== -1) {
      this.down[e.key.toUpperCase()] = true;
    }
  }
}
