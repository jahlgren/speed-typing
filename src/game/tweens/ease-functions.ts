
export function easeOutElastic(t: number, magnitude = 0.7 ) {
  if( t === 0 || t === 1 )
    return t;

  const p = 1 - magnitude;
  const scaledTime = t * 2;

  const s = p / ( 2 * Math.PI ) * Math.asin( 1 );
  return (
    Math.pow( 2, -10 * scaledTime ) *
    Math.sin( ( scaledTime - s ) * ( 2 * Math.PI ) / p )
  ) + 1;
}
