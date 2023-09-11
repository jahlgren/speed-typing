
import MarqueeFlashText from "../game-objects/marquee-flash-text";
import Word from "../game-objects/word";
import AScene from "./a-scene";

import { Graphics, HTMLText } from 'pixi.js';
import PlayScene from "./play-scene";

export default class GameOverScene extends AScene {
  
  private elapsed: number = 0;
  private _bgRect: Graphics|null = null;

  private _title: MarqueeFlashText|null = null;
  private _titleY: number = 0;
  private _titleTargetY: number = 0;
  
  private _word: Word|null = null;
  
  private _stats: HTMLText|null = null;
  private _statsY: number = 0;
  private _statsTargetY: number = 0;

  private _time: number = 0;
  private _correct: number = 0;
  private _incorrect: number = 0;
  
  private _start: boolean = false;
  private _ended: boolean = false;
  
  public constructor(time: number, correct: number, incorrect: number) {
    super();
    this._time = time;
    this._correct = correct;
    this._incorrect = incorrect;
  }

  public begin() {
    this._bgRect = new Graphics();
    this._bgRect.beginFill(0xffffff, 0.05);
    this._bgRect.drawRect(0, 0, 1, 1);
    this._bgRect.endFill();
    this.addChild(this._bgRect);
    this._bgRect.width = this.game.width;
    this._bgRect.height = this.game.height;

    this._title = new MarqueeFlashText({text: 'WELL DONE!'});
    this._title.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._title);
    
    this._word = new Word({text: 'restart'}, this.game.keyboard, this._onRestartWordCompleted.bind(this));
    this._word.alpha = 0;
    this._word.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._word);

    this._stats = new HTMLText(`
      <div style="text-align: center;font-family: Consolas, monospace;font-size: 20px; line-height: 1.5; color: white">
        <div style="margin-bottom:20px;display: flex; flex-direction: column">
          <span style="opacity: 0.5">Score</span>
          <span style="line-height:1;font-size: 2em; font-weight: bold">${this._computeScore()}</span>
        </div> 
        <span style="opacity: 0.5">Time:</span> ${(this._time/1000).toFixed(2)} sec<br>
        <span style="opacity: 0.5">Accuracy:</span> ${((1 - this._incorrect / this._correct) * 100).toFixed(2)} %
      </div>
    `);
    this._stats.anchor.set(0.5, 0);
    this._stats.alpha = 0;
    this._stats.resolution = 2;
    this._stats.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._stats);
  }
  
  public onViewResized() {
    this._title?.position.set(this.game.width/2, this.game.height/2 + this._titleY);
    this._word?.position.set(this.game.width/2, this.game.height/2);
    this._stats?.position.set(this.game.width/2, this.game.height/2 + this._statsY);
    if(this._bgRect) {
      this._bgRect.width = this.game.width;
      this._bgRect.height = this.game.height;
    }
  }

  public update(deltaTime: number) {
    this.elapsed += deltaTime;

    if(!this._ended && this._start && this.alpha < 0.01) {
      this._onChangeToNextScene();
    }

    this._handleOutAnimation(deltaTime);

    this._title?.update(deltaTime);
    this._titleY = this._doPositionAnimationY(this._title!, this._titleY, this._titleTargetY, deltaTime);
    
    if(this.elapsed >= 1.618/2) {
      this._titleTargetY = -100;
      this._statsTargetY = 70;
      this._alphaFade(this._word!, 1, deltaTime * 5);
      this._alphaFade(this._stats!, 1, deltaTime * 5);
      this._statsY = this._doPositionAnimationY(this._stats!, this._statsY, this._statsTargetY, deltaTime);
    }
    
    this._word?.update(deltaTime);
  }

  private _onRestartWordCompleted(): void {
    this._start = true;
  }
  
  private _onChangeToNextScene() {
    this._ended = true;
    this.game.changeScene(new PlayScene());
  }
  
  private _handleOutAnimation(deltaTime: number): void {
    if(this._start) {
      this._alphaFade(this, 0, deltaTime * 10);
      return;
    }
  }

  private _computeScore(): number {
    const accuracy = 1 - Math.min(1, this._incorrect / (this._correct - this._incorrect));
    const time = Math.max(0, 1 - this._time / 60000)
    return Math.round(1200 * time * accuracy * accuracy * accuracy);
  }
}
