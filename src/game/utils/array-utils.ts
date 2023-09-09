export function pickRandom<T>(array: T[]) {
  return array[Math.floor(array.length * Math.random())];
}
