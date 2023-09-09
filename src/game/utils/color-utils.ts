import {Color} from 'pixi.js';

export function lerpColor(from: Color, to: Color, t: number): Color {
  const color = new Color([
    from.red + (to.red - from.red) * t, 
    from.green + (to.green - from.green) * t, 
    from.blue + (to.blue - from.blue) * t
  ]);
  return color;
}
