export default class Keyboard {

  private _state: Set<string>;
  private _previousState: Set<string>;
  
  private _toAdd: Set<string>;
  private _toRemove: Set<string>;
  
  public constructor() {
    this._state = new Set();
    this._previousState = new Set();

    this._toAdd = new Set();
    this._toRemove = new Set();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * Returns true if the given key is held down.
   */
  public getKey(key: string): boolean {
    return this._state.has(key.toLowerCase());
  }

  /**
   * Returns true if the given key was pressed this frame.
   */
  public getKeyDown(key: string) {
    key = key.toLowerCase();
    return this._state.has(key) && !this._previousState.has(key);
  }

  /**
   * Returns true if the given key was released this frame.
   */
  public getKeyUp(key: string) {
    key = key.toLowerCase();
    return !this._state.has(key) && this._previousState.has(key);
  }

  /**
   * Returns true if any key was pressed this frame.
   */
  public getAnyKeyDown() {
    for (const key of this._state) {
      if(this._state.has(key) && !this._previousState.has(key)) {
        return true;
      }
    }
    return false;
  }


  /**
   * Update state. Should be called once every frame.
   */
  public update() {
    this._copyStateIntoPrevious();
    this._handleRemove();
    this._handleAdd();
  }

  private _onKeyDown(e: KeyboardEvent) {
    this._toAdd.add(e.key.toLowerCase());
  }

  private _onKeyUp(e: KeyboardEvent) {
    this._toRemove.add(e.key.toLowerCase());
  }

  private _copyStateIntoPrevious() {
    this._previousState.clear();
    for(let key of this._state) {
      this._previousState.add(key);
    }
  }

  private _handleRemove() {
    for(let key of this._toRemove) {
      // Don't remove key if it somehow was pressed and released on the same frame.
      // In that case we give priority to add and then remove in the next frame.
      if(!this._toAdd.has(key)) {
        this._state.delete(key);
        this._toRemove.delete(key);
      }
    }
  }

  private _handleAdd() {
    for(let key of this._toAdd) {
      this._state.add(key);
    }
    this._toAdd.clear();
  }
}
