

class Globals {
  public static physicsManager: PhysicsManager;
  /**
   * Reference to the first stage created.
   */
  public static stage: Stage;

  public static keyboard: Keyboard;

  public static mouse: Mouse;

  public static initialize(stage: Stage) {
    Globals.physicsManager = new PhysicsManager();
    Globals.keyboard       = new Keyboard();
    Globals.mouse          = new Mouse(stage);
    Globals.stage          = Globals.stage || stage;
  }
}