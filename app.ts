/// <reference path="lib/lib.d.ts"/>

// TODO: parse map json (better than phaser -_-)

@component(new PhysicsComponent({
  solid: true,
  immovable: true
}))
class Ship extends Sprite {
  constructor() {
    super("assets/ship.png");

    this.z = 10;

    this.y = 300;
  }

  update(): void {
    if (Globals.keyboard.down.A) {
      this.physics.moveBy(-5, 0);
    }

    if (Globals.keyboard.down.D) {
      this.physics.moveBy(5, 0);
    }

    if (Globals.keyboard.justDown.Spacebar) {
      console.log("pew pew");
    }
  }
}

/*
class Player extends Sprite {
  public baseName: string = "Player";

  @inspect
  public speed: number = 5;

  @inspect
  public tint: number = 0xff0000;

  constructor() {
    super([
      new PhysicsComponent({
        solid: true,
        immovable: true
      })
    ], "assets/img.png");

    Globals.mouse.events.on(MouseEvents.MouseDown, (p: Point) => {
      this.start = p;
    })

    // this.width = 15;
    // this.height = 15;
  }

  public start: Point = new Point(0, 0);

  update(): void {
    let dx: number = 0;
    let dy: number = 0;

    if (Globals.keyboard.down.D) {
      dx += this.speed;
    }

    if (Globals.keyboard.down.A) {
      dx -= this.speed;
    }

    if (Globals.keyboard.down.W) {
      dy -= this.speed;
    }

    if (Globals.keyboard.down.S) {
      dy += this.speed;
    }

    this.physics.moveBy(dx, dy);

    if (this.physics.touchingBottom) {
      console.log("bot");
    }

    // Raycast debugging stuff.

    const d = Globals.stage.debug;
    const l = new Ray(this.start.x, this.start.y, Globals.mouse.position.x, Globals.mouse.position.y);

    d.draw(l);

    const c = Globals.physicsManager.raycast(l).then(res => {
      d.draw(res.position);
      d.draw(res.sprite.bounds);
    })
  }
}

class Box extends Sprite {
  constructor() {
    super([
      new PhysicsComponent({
        solid: true,
        immovable: true
      })
    ], "assets/img.png");
  }
}
*/

class MyGame extends Game {
  constructor() {
    super(600, 400, document.getElementById("main"), true);

    const ship = new Ship();

    Globals.stage.addChild(ship);

    let tmp = new TiledMapParser("assets/map.json");
    tmp.z = -10;

    Globals.stage.addChild(tmp);

    let someText = new TextField("This is a text test! ")

    Globals.stage.addChild(someText);
  }
}

Util.RunOnStart(() => {
  Debug.DEBUG_MODE = false;

  new MyGame();
});
