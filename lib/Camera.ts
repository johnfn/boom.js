interface CameraLayer {
  parallaxAmount: number;
  contents: Sprite;
}

/**
 * A quick note about coordinate systems. Every layer with a different parallax scroll
 * amount has a different coordinate system associated with it.
 *
 * We call "world space" the coordinate system associated with a parallax amount of 1.
 *
 * We call "screen space" the coordinate system associated with a parallax amount of 0.
 *
 * This function takes points in world space and converts them to any other
 * coordinate system that you could possibly desire.
 */

/**
 * Camera class. Effects what we can see.
 */
class Camera {
  private _layers: CameraLayer[] = [];

  /**
   * x coordinate of the center of the camera in world space.
   */
  private _x: number;

  /**
   * y coordinate of the center of the camera in world space.
   */
  private _y: number;

  // Screen shake state (TODO - should be separated out)

  private static SHAKE_AMT: number = 3;
  private _shakingDuration: number = 0;
  private _isShaking: boolean = false;

  private _hasXYChanged: boolean = false;
  private _initialX: number;
  private _initialY: number;

  /**
   * Width of the HTML element containing the game.
   * @type {number}
   */
  private _gameWidth: number;
  private _gameHeight: number;

  /**
   * The x position of the center of the camera.
   *
   * TODO: This is not consistent!
   */
  public get x(): number { return this._x; }
  public set x(value: number) {
    this._moveTo(value, this._y);

    this._hasXYChanged = true;
  }

  /**
   * The y position of the center of the camera.
   */
  public get y(): number { return this._y; }
  public set y(value: number) {
    this._moveTo(this._x, value);

    this._hasXYChanged = true;
  }

  public get width(): number { return this._gameWidth; }
  public get height(): number { return this._gameHeight; }

  constructor(stage: Stage) {
    this._gameWidth = stage.width;
    this._gameHeight = stage.height;
  }

  /**
   * Get the top left coordinate of the camera, optionally not in world space
   * if you pass in a different argument for parallax.
   * @param parallax
   */
  public topLeft(parallax = 1): Point {
    return new Point(
      this._x * parallax,
      this._y * parallax
    );
  }

  /**
   * Get the bottom right coordinate of the camera, optionally not in world space
   * if you pass in a different argument for parallax.
   * @param parallax
   */
  public bottomRight(parallax = 1): Point {
    return new Point(
      this._x * parallax + this._gameWidth,
      this._y * parallax + this._gameHeight
    );
  }

  /**
   * Add a layer to the camera.
   *
   * You can optionally specify a parallax amount which effects how much the layer
   * moves with the camera.
   *
   * parallaxAmount of 1 is the behavior you'd expect from a camera. The object is
   * only visible so long as it is within the frame of the camera.
   *
   * parallaxAmount of 0 means the layer stays fixed on the camera. Useful for HUD stuff which
   * is fixed on the screen.
   *
   * parallaxAmount is otherwise interpolated. A parallaxAmount of 0.2 is handy for e.g
   * parallaxed backgrounds.
   *
   * @param layer
   * @param parallaxAmount
   */
  public addLayer(contents: Sprite, parallaxAmount = 1): void {
    Globals.fixedStage.addChild(contents);

    this._layers.push({
      contents,
      parallaxAmount,
    });
  }

  public shakeScreen(duration = 10): void {
    this._shakingDuration = duration;

    this._isShaking = true;
    this._hasXYChanged = false;
    this._initialX = this.x;
    this._initialY = this.y;
  }

  public update(): void {
    if (this._isShaking) {
      this.shake();
    }
  }

  /**
   * Internal function that moves the camera. Rounds off to nearest
   * number and moves all layers.
   *
   * @param {number} x
   * @param {number} y
   */
  private _moveTo(x: number, y: number): void {
    // Round to avoid artifacts

    this._x = Math.round(x);
    this._y = Math.round(y);

    for (const layer of this._layers) {
      layer.contents.x = - this._x * layer.parallaxAmount;
      layer.contents.y = - this._y * layer.parallaxAmount;
    }
  }

  private stopShaking(): void {
    if (!this._hasXYChanged) {
      this.x = this._initialX;
      this.y = this._initialY;
    }

    this._isShaking = false;
  }

  private shake(): void {
    this._shakingDuration--;

    if (this._shakingDuration < 0) {
      this.stopShaking();
      return;
    }

    // The problem here is that sometimes the camera is static, which means
    // we have to remember its coordinates (so we can set it back later) and sometimes
    // it's not, so we have to be sure *not* to set it back later.

    // The only way that _hasXYChanged gets set is when someone with follow logic
    // sets it outside of Camera, so we listen for that to determine what to do.

    // TODO: I think the camera should have the following logic now, rather than
    // a sprite. I mean, when are you ever going to follow 2 sprites anyways -_-

    if (this._hasXYChanged) {
      this._moveTo(Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT),
                   Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT));
    } else {
      this._moveTo(this._initialX + Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT),
                   this._initialY + Util.RandomRange(-Camera.SHAKE_AMT, Camera.SHAKE_AMT));
    }
  }
}