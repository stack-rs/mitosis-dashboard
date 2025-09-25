function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function leftRotate(value: number, amount: number): number {
  return (value << amount) | (value >>> (32 - amount));
}

export function md5(input: string): number[] {
  const message = stringToUint8Array(input);
  const msgLength = message.length;
  const bitLength = msgLength * 8;

  // Pad message
  const paddedLength = Math.ceil((bitLength + 65) / 512) * 512;
  const paddedBytes = paddedLength / 8;
  const padded = new Uint8Array(paddedBytes);
  padded.set(message);
  padded[msgLength] = 0x80;

  // Append length as 64-bit little-endian
  const view = new DataView(padded.buffer);
  view.setUint32(paddedBytes - 8, bitLength, true);
  view.setUint32(paddedBytes - 4, Math.floor(bitLength / 0x100000000), true);

  // MD5 constants
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  const r = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
  ];

  // Process message in 512-bit chunks
  for (let offset = 0; offset < paddedBytes; offset += 64) {
    const w = new Array(16);
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, true);
    }

    let [a, b, c, d] = h;

    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      f = (f + a + k[i] + w[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + leftRotate(f, r[i])) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
  }

  // Convert to byte array
  const result = new Array(16);
  for (let i = 0; i < 4; i++) {
    result[i * 4] = h[i] & 0xff;
    result[i * 4 + 1] = (h[i] >>> 8) & 0xff;
    result[i * 4 + 2] = (h[i] >>> 16) & 0xff;
    result[i * 4 + 3] = (h[i] >>> 24) & 0xff;
  }

  return result;
}
