import { Container, DisplayObject } from 'pixi.js';
import Game from '../game';

export default abstract class AScene extends Container  {
  private _game: Game|null = null;

  protected get game(): Game { return this._game! }; 

  /**
   * You should not call this method manualy.
   * This method is used by the `Game` in order to initialze the scene.
   * @param game Game
   */
  public init(game: Game): void {
    this._game = game;
  }

  /**
   * Event that will be called if the view of the game resizes.
   */
  public onViewResized(): void {}

  /**
   * Event that will be called before the scene is added to the game stage.
   */
  public begin(): void { }

  /**
   * Event that will be called just before removing the scene from the game stage.
   */
  public end(): void { }

  /**
   * The `Game` will call this method every frame.
   * @param deltaTime number Delta time in seconds since last frame.
  */
  // @ts-ignore
  public update(deltaTime: number): void { }

  
  protected _alphaFade(sprite: DisplayObject, target: number, deltaTime: number) {
    const da = target - sprite.alpha
    if(da > -0.01 && da < 0.01) {
      sprite.alpha = target;
      return;
    }
    sprite.alpha += da * deltaTime;
  }
  
  protected _doPositionAnimationY(sprite: DisplayObject, currentY: number, targetY: number, deltaTime: number): number {
    const x = this.game.width / 2;
    const y = this.game.height / 2;

    const dy = targetY - currentY;
    if(dy > -1 && dy < 1)
      currentY = targetY;
    else 
      currentY += dy * (1 - (1 / (1 + deltaTime))) * 10;

    sprite.position.set(x, y + currentY);

    return currentY;
  }
}
