import {Container, Text, TextStyle, TextStyleFontWeight, Color} from 'pixi.js';
import { easeOutElastic } from '../tweens/ease-functions';

export type CountdownOptions = {
  from: number,
  to: number,
  onFinishedCallback: () => void,
  font: {
    fontFamily: string,
    fontSize: number,
    fontWeight: TextStyleFontWeight,
    fill: Color
  }
}

export default class Countdown extends Container {
  private _options: CountdownOptions;

  private _value: number;
  private _time: number = 1;
  private _text: Text;
  private _animationTime: number = 0;

  public constructor(options?: Partial<CountdownOptions>) {
    super();
    
    this._options = {...defaultOptions, ...options};

    this._value = this._options.from;

    const textStyle: Partial<TextStyle> = {
      ...this._options.font,
      fill: this._options.font.fill.toHex(),
      align: 'center'
    }
    this._text = new Text(this._options.from, textStyle);
    this._text.anchor.set(0.5, 0.5);
    this.addChild(this._text);
    this._updateText();
  }

  public update(deltaTime: number): void {
    if(this._value < 1)
      return;

    this._time -= deltaTime;
    if(this._time <= 0) {
      this._time = 1;
      this._value--;
      this._updateText();
    }

    if(this._value < 1) {
      this._options.onFinishedCallback();
    }

    const scale = 1 + -0.3 * easeOutElastic(1 - this._animationTime, 0.7) + 0.3;
    this._text.scale.set(scale);
    this._text.alpha = 0.5 + this._animationTime * 0.5;

    this._animationTime = Math.max(0, this._animationTime - deltaTime);
  }

  private _updateText(): void {
    this._animationTime = 1;
    this._text.text = this._value.toString();
  }
}

const defaultOptions: CountdownOptions = {
  from: 3,
  to: 0,
  onFinishedCallback: () => {},
  font: {
    fontFamily: 'Consolas, monospace',
    fontSize: 80,
    fontWeight: '700',
    fill: new Color(0xffffff)
  }
};
