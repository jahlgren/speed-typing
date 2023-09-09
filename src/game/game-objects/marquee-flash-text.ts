import { Container, Text, TextStyle, TextStyleFontWeight, Color } from 'pixi.js';
import { easeOutElastic } from '../tweens/ease-functions';
import { lerpColor } from '../utils/color-utils';

type CharacterData = {
  sprite: Text,
  timing: {
    delay: number,
    bounceTime: number,
    fillTime: number
  }
}

export type MarqueeFlashTextOptions = {
  text: string,
  animation: {
    nextCharacterDelay: number,
    nextBounceDelay: number,
    bounceHeight: number,
    bounceSpeed: number,
    highlightFill: Color,
    fillSpeed: number
  },
  font: {
    fontFamily: string,
    fontSize: number,
    fontWeight: TextStyleFontWeight
    fill: Color,
  }
}

export default class MarqueeFlashText extends Container {
  
  private _options: MarqueeFlashTextOptions;
  private _characters: CharacterData[] = [];
  
  private _nextBounceIndex: number = 0;
  private _bounceDelay: number;

  public constructor(options: Partial<MarqueeFlashTextOptions> ) {
    super();

    this._options = {...defaultOptions, ...options};

    this._initializeCharacters();

    this._bounceDelay = this._options.animation.nextBounceDelay;
  }

  public update(deltaTime: number): void {

    this._handleBounceDelay(deltaTime);

    let character: CharacterData;
    let x: number = -this._computeTotalVisibleWidth() / 2 + this._characters[0].sprite.width / 2;
    
    for(let i = 0; i < this._characters.length; i++) {
      character = this._characters[i];
      if(this._handleCharacterInAnimationDelay(character, deltaTime))
        continue;

      x = this._handleCharacterBounce(character, x, deltaTime);
      this._handleCharacterFill(character, deltaTime);
    }
  }

  private _handleBounceDelay(deltaTime: number): void {
    this._bounceDelay -= deltaTime;
    if(this._bounceDelay <= 0) {
      this._characters[this._nextBounceIndex].timing.fillTime = 1;
      this._characters[this._nextBounceIndex].timing.bounceTime = 1;
      this._nextBounceIndex++;
      if(this._nextBounceIndex >= this._characters.length) {
        this._nextBounceIndex = 0;
        this._bounceDelay = this._options.animation.nextBounceDelay;
      }
      else {
        this._bounceDelay = this._options.animation.nextCharacterDelay;
      }
    }
  }

  private _handleCharacterInAnimationDelay(character: CharacterData, deltaTime: number): boolean {
    if(character.sprite.visible)
      return false;

    character.timing.delay -= deltaTime;

    if(character.timing.delay <= 0) {
      character.sprite.visible = true;
      return false;
    }

    return true;
  }

  private _handleCharacterBounce(character: CharacterData, x: number, deltaTime: number): number {
    const y = (
      -this._options.animation.bounceHeight 
      + easeOutElastic(1 - character.timing.bounceTime, 0.84) * this._options.animation.bounceHeight
      );
    character.sprite.position.set(x, y);
    character.timing.bounceTime = Math.max(0, character.timing.bounceTime - deltaTime * this._options.animation.bounceSpeed);
    return x + character.sprite.width;
  }
  
  private _handleCharacterFill(character: CharacterData, deltaTime: number): void {
    character.sprite.tint = lerpColor(this._options.font.fill, this._options.animation.highlightFill, character.timing.fillTime).toHex();
    character.timing.fillTime = Math.max(0, character.timing.fillTime - deltaTime * this._options.animation.fillSpeed);
  }

  private _computeTotalVisibleWidth(): number {
    let total = 0;
    for(let i = 0; i < this._characters.length; i++)
      total += this._characters[i].sprite.visible ? this._characters[i].sprite.width : 0;
    return total;
  }

  private _initializeCharacters(): void {
    const textStyle: Partial<TextStyle> = {
      ...this._options.font,
      fill: 0xffffff
    }

    for(let i = 0; i < this._options.text.length; i++) {
      const character: CharacterData = {
        sprite: new Text(this._options.text.charAt(i), textStyle),
        timing: {
          delay: this._options.animation.nextCharacterDelay * (i + 1),
          bounceTime: 1,
          fillTime: 1
        }
      }
      
      character.sprite.anchor.set(0.5, 0.5);
      character.sprite.visible = false;
      character.sprite.tint = this._options.font.fill;

      this._characters.push(character);
      this.addChild(character.sprite);
    }
  }
}

const defaultOptions: MarqueeFlashTextOptions = {
  text: '?',
  animation: {
    nextCharacterDelay: 0.02,
    nextBounceDelay: 2,
    bounceHeight: 4,
    bounceSpeed: 0.25,
    highlightFill: new Color(0xff145b),
    fillSpeed: 1.5
  },
  font: {
    fontFamily: 'Consolas, monospace',
    fontSize: 48,
    fontWeight: '700',
    fill: new Color(0xaaaaaa),
  }
}
