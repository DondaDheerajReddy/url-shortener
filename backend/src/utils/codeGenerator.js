const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function toBase62(num) {
  if (typeof num !== 'number' || num < 1) {
    throw new Error(`toBase62 requires a positive integer, got: ${num}`);
  }
  let result = '';
  while (num > 0) {
    result = BASE62[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

function fromBase62(str) {
  let num = 0;
  for (const char of str) {
    const index = BASE62.indexOf(char);
    if (index === -1) throw new Error(`Invalid base62 character: ${char}`);
    num = num * 62 + index;
  }
  return num;
}

export { toBase62, fromBase62 };