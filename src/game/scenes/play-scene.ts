import Countdown from "../game-objects/countdown";
import Word from "../game-objects/word";
import { easeOutElastic } from "../tweens/ease-functions";
import AScene from "./a-scene";

import wordList from './../../words.json';
import { pickRandom } from "../utils/array-utils";
import { Graphics } from 'pixi.js';
import GameOverScene from "./game-over-scene";

export default class PlayScene extends AScene {
  
  private readonly _maxWordCount: number = 10;

  private _countdown: Countdown|null = null;
  private _word: Word|null = null;
  private _wordAnimationTime: number = 0;
  private _bgRect: Graphics|null = null;

  private _level: number = 0;
  private _wordCount: number = 0;
  private _transitionToGameOverTime: number = 0;

  private _startTime: number = 0;
  private _endTime: number = 0;
  private _correct: number = 0;
  private _incorrect: number = 0;
  
  public begin() {
    this._bgRect = new Graphics();
    this._bgRect.beginFill(0xffffff, 0.05);
    this._bgRect.drawRect(0, 0, 1, 1);
    this._bgRect.endFill();
    this.addChild(this._bgRect);
    this._bgRect.width = 0;
    this._bgRect.height = this.game.height;


    this._countdown = new Countdown({ onFinishedCallback: this._onCountdownFinished.bind(this) });
    this._countdown.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._countdown);
  }
  
  public onViewResized() {
    this._countdown?.position.set(this.game.width/2, this.game.height/2);
    this._word?.position.set(this.game.width/2, this.game.height/2);
    
    if(this._bgRect) {
      this._bgRect.height = this.game.height;
    }
  }

  public update(deltaTime: number) {
    this._countdown?.update(deltaTime);
    this._word?.update(deltaTime);

    const scale = 1 + -0.3 * easeOutElastic(1 - this._wordAnimationTime, 0.5) + 0.3;
    this._word?.scale.set(scale);

    this._wordAnimationTime = Math.max(0, this._wordAnimationTime - deltaTime);

    const bgRectWidth = (this._wordCount-1) / this._maxWordCount * this.game.width;
    const dw = bgRectWidth - this._bgRect!.width;
    this._bgRect!.width = dw > -0.01 && dw < 0.01 ? bgRectWidth : this._bgRect!.width + dw * deltaTime * 10;

    this._handleTransitionToGameOver(deltaTime);
  }

  private _handleTransitionToGameOver(deltaTime: number) {
    if(this._transitionToGameOverTime <= 0.0001) 
      return;

    this._transitionToGameOverTime -= deltaTime;

    if(this._transitionToGameOverTime <= 0.0001) {
      this.game.changeScene(new GameOverScene(this._endTime - this._startTime, this._correct, this._incorrect));
    }
  }

  private _onCountdownFinished(): void {
    this.removeChild(this._countdown!);
    this._countdown = null;
    this._newWord();
    this._startTime = new Date().getTime();
  }

  private _onWordCompleted(correct: number, incorrect: number): void {

    this._correct += correct;
    this._incorrect += incorrect;

    if(this._wordCount >= this._maxWordCount) {
      this._word?.removeFromParent();
      this._wordCount++;
      this._transitionToGameOverTime = 0.25;
      this._endTime = new Date().getTime();
      return;
    }

    this._newWord();
  }

  private _newWord(): void {

    /**
     * TODO: Use object pooling instead of creating a new word each time.
     */

    if(this._word) {
      this.removeChild(this._word);
    }

    const word = pickRandom(wordList.words[this._level]);

    this._word = new Word({text: word}, this.game.keyboard, this._onWordCompleted.bind(this));
    this._word.position.set(this.game.width/2, this.game.height/2);
    this.addChild(this._word);

    this._wordAnimationTime = 1;
    this._wordCount++;

    switch(this._wordCount) {
      case 2: this._level = 1; break;
      case 5: this._level = 2; break;
      case 8: this._level = 3; break;
    }
  }
}
