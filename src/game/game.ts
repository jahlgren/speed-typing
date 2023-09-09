import { Application } from 'pixi.js';
import AScene from './scenes/a-scene';
import Keyboard from './keyboard';

export default class Game {
  private _pixi: Application;
  private _scene: AScene|null = null;
  private _keyboard: Keyboard;

  public constructor(initialScene: AScene, container: HTMLElement) {
    this._keyboard = new Keyboard();

    this._pixi = new Application({
      background: '#111111',
      resizeTo: container,
      antialias: true
    });
    container.appendChild(this._pixi.view as unknown as Node);

    this._initializeScreenResizeEvent(container);
    this._pixi.ticker.add(this._update.bind(this));
    this.changeScene(initialScene);
  }

  public get width(): number {
    return this._pixi.view.width;
  }

  public get height(): number {
    return this._pixi.view.height;
  }

  public get keyboard(): Keyboard {
    return this._keyboard;
  }

  public changeScene(newScene: AScene) {
    if(this._scene) {
      this._scene.end();
      this._pixi.stage.removeChild(this._scene);
    }
    this._scene = newScene;
    if(this._scene) {
      this._scene.init(this);
      this._scene.begin();
      this._pixi.stage.addChild(this._scene);
    }
  }

  private _update() {
    this._keyboard.update();

    if(this._scene == null)
      return;
    
      this._scene.update(Math.min(1/10, this._pixi.ticker.elapsedMS / 1000.0));
  }

  private _initializeScreenResizeEvent(container: HTMLElement) {
    const observer = new ResizeObserver(() => {
      this._scene?.onViewResized();
    });
    observer.observe(container);
  }
}
