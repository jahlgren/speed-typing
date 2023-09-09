import { Graphics, Container, Text, TextStyle, TextStyleFontWeight, Color } from 'pixi.js';
import Keyboard from '../keyboard';
import { easeOutElastic } from '../tweens/ease-functions';
import { lerpColor } from '../utils/color-utils';

type CharacterData = {
  sprite: Text,
  bounceTime: number,
  incorrectTime: number
}

export type WordOptions = {
  text: string,
  animation: {
    bounceHeight: number,
    bounceSpeed: number,
    incorrectFill: Color
  },
  font: {
    fontFamily: string,
    fontSize: number,
    fontWeight: TextStyleFontWeight,
    fill: Color
  }
}

export default class Word extends Container {

  private _options: WordOptions;
  private _characters: CharacterData[] = [];
  private _characterSpacing = 10;
  private _keyboard: Keyboard;

  private _caretTime: number = 0;
  private _caret: Graphics;

  private _correct: number = 0;
  private _incorrect: number = 0;

  private _next: number = 0;

  private _onCompletedCallback: (correct: number, incorrect: number) => void;

  public constructor(options: Partial<WordOptions>, keyboard: Keyboard, onCompletedCallback: (correct: number, incorrect: number) => void) {
    super();

    this._keyboard = keyboard;
    this._onCompletedCallback = onCompletedCallback;

    this._options = {...defaultOptions, ...options};
    this._initializeCharacters(this._options.text);

    this._caret = new Graphics();
    this._initializeCaret();
  }

  public update(deltaTime: number) {
    this._handleInput();
    this._updateCharacters(deltaTime);
    this._updateCaret(deltaTime);
  }

  private _handleInput() {
    if(this._next >= this._characters.length || !this._keyboard.getAnyKeyDown())
      return;

    const character: CharacterData = this._characters[this._next];
    if(this._keyboard.getKeyDown(this._characters[this._next].sprite.text)) {
      character.sprite.alpha = 1;
      character.bounceTime = 1;
      this._next++;
      character.incorrectTime = 0;
      this._correct++;
    }
    else {
      character.incorrectTime = 1;
      this._incorrect++;
    }

    if(this._next >= this._characters.length) 
      this._onCompletedCallback(this._correct, this._incorrect);
  }

  private _updateCharacters(deltaTime: number) {
    let character: CharacterData;

    if(this._next < this._characters.length) {
      character = this._characters[this._next];
      character.sprite.alpha = 0.66;
      this._handleIncorrectAnimation(character, deltaTime);
    }

    const length = Math.min(this._next, this._characters.length);
    for(let i = 0; i < length; i++) {
      character = this._characters[i];
      this._handleBounceAnimation(character, deltaTime);
      this._handleIncorrectAnimation(character, deltaTime);
    }
  }

  private _handleBounceAnimation(character: CharacterData, deltaTime: number) {
    const y = (
      -this._options.animation.bounceHeight * 2 
      + easeOutElastic(1 - character.bounceTime, 0.7) * this._options.animation.bounceHeight
    );
    character.sprite.position.set(character.sprite.position.x, y);
    character.bounceTime = Math.max(0, character.bounceTime - deltaTime * this._options.animation.bounceSpeed);
  }

  private _handleIncorrectAnimation(character: CharacterData, deltaTime: number) {
    const rotation = -1 + easeOutElastic(1 - character.incorrectTime*1.025, 0.9);
    character.sprite.rotation = rotation;
    if(character.incorrectTime > 0) {
      const y = 6 + easeOutElastic(1 - character.incorrectTime, 0.8) * -6;
      character.sprite.position.set(character.sprite.position.x, y);
      character.sprite.alpha = 0.66 + character.incorrectTime * 0.34;
    }
    character.sprite.tint = lerpColor(this._options.font.fill, this._options.animation.incorrectFill, character.incorrectTime);
    character.incorrectTime = Math.max(0, character.incorrectTime - deltaTime * 0.25);
  }

  private _updateCaret(deltaTime: number) {
    if(this._next >= this._characters.length) {
      this._caret.visible = false;
      return;
    }
    this._caretTime += deltaTime;
    const character = this._characters[this._next];
    this._caret.position.set(character.sprite.position.x, character.sprite.height/2 + 4 + Math.sin(this._caretTime*4) * 4);
  }

  private _initializeCharacters(word: string) {
    const textStyle: Partial<TextStyle> = {
      ...this._options.font,
      fill: 0xffffff
    }

    let totalWidth = this._characterSpacing * (word.length - 1);
    for(let i = 0; i < word.length; i++) {
      
      /**
       * TODO: Make use of an object pool instead of creating new Text objects for every character.
       */
      const character: CharacterData = {
        sprite: new Text(word.charAt(i), textStyle),
        bounceTime: 0,
        incorrectTime: 0
      };
      
      character.sprite.anchor.set(0.5, 0.5);
      character.sprite.alpha = 0.4;
      character.sprite.tint = this._options.font.fill;
      
      this._characters.push(character);
      this.addChild(character.sprite);

      totalWidth += character.sprite.width;
    }

    let x = -totalWidth/2 + this._characters[0].sprite.width/2;
    for(let i = 0; i < this._characters.length; i++) {
      const character = this._characters[i];
      character.sprite.position.set(x, 0);
      x += character.sprite.width + this._characterSpacing;
    }
  }

  private _initializeCaret() {
    this._caret.lineStyle({width: 4, color: 0xff145b});
    this._caret.moveTo(-8, 8);
    this._caret.lineTo(0, 0);
    this._caret.lineTo(8, 8);
    this._caret.alpha = 0.75;
    this.addChild(this._caret);
  }
}

const defaultOptions: WordOptions = {
  text: '?',
  animation: {
    bounceHeight: 10,
    bounceSpeed: 1,
    incorrectFill: new Color(0xff145b)
  },
  font: {
    fontFamily: 'Consolas, monospace',
    fontSize: 40,
    fontWeight: '700',
    fill: new Color(0xffffff)
  }
}
