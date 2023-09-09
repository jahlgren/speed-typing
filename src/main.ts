import './style.css';

import Game from './game/game';
import WelcomeScene from './game/scenes/welcome-scene';

// @ts-ignore
const game = new Game(
    new WelcomeScene(), 
    document.querySelector('#app')!);
