/// <reference path="lib/lib.d.ts"/>

@component(new PhysicsComponent({
  immovable: true,
  solid: true,
}))
class Ship extends Sprite {
  constructor() {
    super("assets/ship.png");

    this.z = 10;

    this.y = 300;
  }

  update(): void {
    Globals.camera.x = this.x;
    Globals.camera.y = this.y;

    if (Globals.keyboard.down.A) {
      this.physics.moveBy(-5, 0);
    }

    if (Globals.keyboard.down.D) {
      this.physics.moveBy(5, 0);
    }

    if (Globals.keyboard.down.W) {
      this.physics.moveBy(0, -5);
    }

    if (Globals.keyboard.down.S) {
      this.physics.moveBy(0, 5);
    }

    if (Globals.keyboard.justDown.Spacebar) {
      console.log("hello?");

      const bullet = new Bullet(new Point(0, -1));

      Globals.stage.addChild(bullet);

      bullet.x = this.x;
      bullet.y = this.y - 40;
    }
  }
}


class MovingComponent extends Component<Bullet> {
  public postUpdate(): void { }
  public preUpdate() : void { }
  public update(): void {
    super.update();

    this._sprite.physics.moveBy(0, -1);
  }
}

@component(new DestroyWhenOffscreen())
@component(new MovingComponent())
@component(new PhysicsComponent({ solid: true, immovable: true }))
class Bullet extends Sprite {
  constructor(velocity: Point) {
    super('assets/bullet.png');

    this.z = 20;

    this.physics.collidesWith = Sprites.all(Ship);
  }
}

@component(new PhysicsComponent({
  solid: true,
  immovable: true
}))
class Enemy extends Sprite {
  constructor() {
    super("assets/ship.png");

    this.z = 10;
    this.y = 0;
  }

  update(): void {
    this.physics.moveBy(0, -5);
  }
}

class EnemySpawner extends Sprite {
  private _stage: Stage;

  constructor(stage: Stage) {
    super();

    this._stage = stage;
  }

  update(): void {
    if (Math.random() > .95) {
      Globals.stage.addChild(new Enemy());
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
    super(600, 400, document.getElementById("main"), 0x000000, true);

    const ship = new Ship();

    Globals.stage.addChild(ship);

    let tmp = new TiledMapParser("assets/map.json");
    tmp.z = -10;

    tmp.parse();

    Globals.stage.addChild(tmp);

    Globals.stage.addChild(new EnemySpawner(Globals.stage));

    new FPSCounter();

    const test = new TextField("This is [a test](red)xand [this should be blue](blue)")

    Globals.stage.addChild(test);

    console.log(new Point(20, 20))
  }
}

Util.RunOnStart(() => {
  Game.DEBUG_MODE = true;

  new MyGame();
});
