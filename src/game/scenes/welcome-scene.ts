import AScene from "./a-scene";
import MarqueeFlashText from '../game-objects/marquee-flash-text';
import Word from "../game-objects/word";
import {Text} from 'pixi.js';
import PlayScene from "./play-scene";

export default class WelcomeScene extends AScene {
  
  private elapsed: number = 0;

  private _heading: MarqueeFlashText|null = null;
  private _headingY: number = 0;
  private _headingTargetY: number = 0;

  private _footer: Text|null = null;
  private _mobile: Text|null = null;

  private _word: Word|null = null;

  private _start: boolean = false;
  private _ended: boolean = false;

  public begin() {
    this._heading = new MarqueeFlashText({text: 'SPEED TYPING'});
    this._heading.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._heading);

    this._word = new Word({text: 'start'}, this.game.keyboard, this._onStartWordCompleted.bind(this));
    this._word.alpha = 0;
    this._word.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._word);

    this._footer = new Text('How fast can you type? \nStart by typing "start"', {
      fontFamily: 'Consolas, monospace',
      fontSize: 20,
      fontWeight: '700',
      align: 'center',
      wordWrapWidth: 10,
      fill: 0xff145b,
      lineHeight: 30
    });
    this._footer.anchor.set(0.5, 0.5);
    this._footer.alpha = 0;
    this._footer.position.set(this.game.width/2, this.game.height/2 + 100);
    this.addChild(this._footer);
    
    this._mobile = new Text('(sorry, does not work on mobile)', {
      fontFamily: 'Consolas, monospace',
      fontSize: 16,
      fontWeight: '700',
      align: 'center',
      wordWrapWidth: 10,
      fill: 0xffffff
    });
    this._mobile.anchor.set(0.5, 0.5);
    this._mobile.alpha = 0;
    this._mobile.position.set(this.game.width/2, this.game.height/2 + 180);
    this.addChild(this._mobile);
  }

  public onViewResized() {
    this._heading?.position.set(this.game.width/2, this.game.height/2 + this._headingY);
    this._word?.position.set(this.game.width/2, this.game.height/2);
    this._footer?.position.set(this.game.width/2, this.game.height/2 + 100);
    this._mobile?.position.set(this.game.width/2, this.game.height/2 + 180);
  }

  public update(deltaTime: number) {
    this.elapsed += deltaTime;

    if(!this._ended && this._start && this.alpha < 0.01) {
      this._onChangeToNextScene();
    }

    this._handleInAnimation(deltaTime);
    this._handleOutAnimation(deltaTime);
    
    this._heading!.update(deltaTime);
    this._headingY = this._doPositionAnimationY(this._heading!, this._headingY, this._headingTargetY, deltaTime);

    this._word?.update(deltaTime);
  }

  private _onStartWordCompleted() {
    this._start = true;
  }

  private _onChangeToNextScene() {
    this._ended = true;
    this.game.changeScene(new PlayScene());
  }

  private _handleInAnimation(deltaTime: number): void {
    if(this.elapsed >= 1.618) {
      this._headingTargetY = -100;
      this._alphaFade(this._word!, 1, deltaTime * 5);
    }

    if(this.elapsed > 1.618 + 1) 
      this._alphaFade(this._footer!, 1, deltaTime * 5);

    if(this.elapsed > 1.618 + 2) 
      this._alphaFade(this._mobile!, 0.5, deltaTime * 5);
  }

  private _handleOutAnimation(deltaTime: number): void {
    if(this._start) {
      this._alphaFade(this, 0, deltaTime * 10);
      return;
    }
  }
}
