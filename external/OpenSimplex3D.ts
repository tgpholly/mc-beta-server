// This is free and unencumbered software released into the public domain

import shuffleSeed from "./shuffle_seed";

const NORM_3D = 1.0 / 103.0;
const SQUISH_3D = (Math.sqrt(3 + 1) - 1) / 3;
const STRETCH_3D = (1 / Math.sqrt(3 + 1) - 1) / 3;

export type Noise3D = (x: number, y: number, z: number) => number;

interface Contribution3D {
  dx: number;
  dy: number;
  dz: number;
  next?: Contribution3D;
  xsb: number;
  ysb: number;
  zsb: number;
}

function contribution3D(
  multiplier: number,
  xsb: number,
  ysb: number,
  zsb: number,
): Contribution3D {
  return {
    dx: -xsb - multiplier * SQUISH_3D,
    dy: -ysb - multiplier * SQUISH_3D,
    dz: -zsb - multiplier * SQUISH_3D,
    xsb,
    ysb,
    zsb,
  };
}

export function makeNoise3D(clientSeed: number): Noise3D {
  const contributions: Contribution3D[] = [];
  for (let i = 0; i < p3D.length; i += 9) {
    const baseSet = base3D[p3D[i]];
    let previous: Contribution3D | null = null;
    let current: Contribution3D | null = null;
    for (let k = 0; k < baseSet.length; k += 4) {
      current = contribution3D(
        baseSet[k],
        baseSet[k + 1],
        baseSet[k + 2],
        baseSet[k + 3],
      );
      if (previous === null) contributions[i / 9] = current;
      else previous.next = current;
      previous = current;
    }
    current!.next = contribution3D(
      p3D[i + 1],
      p3D[i + 2],
      p3D[i + 3],
      p3D[i + 4],
    );
    current!.next.next = contribution3D(
      p3D[i + 5],
      p3D[i + 6],
      p3D[i + 7],
      p3D[i + 8],
    );
  }
  const lookup: Contribution3D[] = [];
  for (let i = 0; i < lookupPairs3D.length; i += 2) {
    lookup[lookupPairs3D[i]] = contributions[lookupPairs3D[i + 1]];
  }

  const perm = new Uint8Array(256);
  const perm3D = new Uint8Array(256);
  const source = new Uint8Array(256);
  for (let i = 0; i < 256; i++) source[i] = i;
  let seed = new Uint32Array(1);
  seed[0] = clientSeed;
  seed = shuffleSeed(shuffleSeed(shuffleSeed(seed)));
  for (let i = 255; i >= 0; i--) {
    seed = shuffleSeed(seed);
    const r = new Uint32Array(1);
    r[0] = (seed[0] + 31) % (i + 1);
    if (r[0] < 0) r[0] += i + 1;
    perm[i] = source[r[0]];
    perm3D[i] = (perm[i] % 24) * 3;
    source[r[0]] = source[i];
  }

  return (x: number, y: number, z: number): number => {
    const stretchOffset = (x + y + z) * STRETCH_3D;

    const xs = x + stretchOffset;
    const ys = y + stretchOffset;
    const zs = z + stretchOffset;

    const xsb = Math.floor(xs);
    const ysb = Math.floor(ys);
    const zsb = Math.floor(zs);

    const squishOffset = (xsb + ysb + zsb) * SQUISH_3D;

    const dx0 = x - (xsb + squishOffset);
    const dy0 = y - (ysb + squishOffset);
    const dz0 = z - (zsb + squishOffset);

    const xins = xs - xsb;
    const yins = ys - ysb;
    const zins = zs - zsb;

    const inSum = xins + yins + zins;
    const hash = (yins - zins + 1) |
      ((xins - yins + 1) << 1) |
      ((xins - zins + 1) << 2) |
      (inSum << 3) |
      ((inSum + zins) << 5) |
      ((inSum + yins) << 7) |
      ((inSum + xins) << 9);

    let value = 0;

    for (
      let c: Contribution3D | undefined = lookup[hash];
      c !== undefined;
      c = c.next
    ) {
      const dx = dx0 + c.dx;
      const dy = dy0 + c.dy;
      const dz = dz0 + c.dz;

      const attn = 2 - dx * dx - dy * dy - dz * dz;
      if (attn > 0) {
        const px = xsb + c.xsb;
        const py = ysb + c.ysb;
        const pz = zsb + c.zsb;

        const indexPartA = perm[px & 0xff];
        const indexPartB = perm[(indexPartA + py) & 0xff];
        const index = perm3D[(indexPartB + pz) & 0xff];

        const valuePart = gradients3D[index] * dx +
          gradients3D[index + 1] * dy +
          gradients3D[index + 2] * dz;

        value += attn * attn * attn * attn * valuePart;
      }
    }
    return value * NORM_3D;
  };
}

const base3D = [
  [0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [2, 1, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 3, 1, 1, 1],
  [1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 2, 1, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1],
];

const gradients3D = [
  -11,
  4,
  4,
  -4,
  11,
  4,
  -4,
  4,
  11,
  11,
  4,
  4,
  4,
  11,
  4,
  4,
  4,
  11,
  -11,
  -4,
  4,
  -4,
  -11,
  4,
  -4,
  -4,
  11,
  11,
  -4,
  4,
  4,
  -11,
  4,
  4,
  -4,
  11,
  -11,
  4,
  -4,
  -4,
  11,
  -4,
  -4,
  4,
  -11,
  11,
  4,
  -4,
  4,
  11,
  -4,
  4,
  4,
  -11,
  -11,
  -4,
  -4,
  -4,
  -11,
  -4,
  -4,
  -4,
  -11,
  11,
  -4,
  -4,
  4,
  -11,
  -4,
  4,
  -4,
  -11,
];

const lookupPairs3D = [
  0,
  2,
  1,
  1,
  2,
  2,
  5,
  1,
  6,
  0,
  7,
  0,
  32,
  2,
  34,
  2,
  129,
  1,
  133,
  1,
  160,
  5,
  161,
  5,
  518,
  0,
  519,
  0,
  546,
  4,
  550,
  4,
  645,
  3,
  647,
  3,
  672,
  5,
  673,
  5,
  674,
  4,
  677,
  3,
  678,
  4,
  679,
  3,
  680,
  13,
  681,
  13,
  682,
  12,
  685,
  14,
  686,
  12,
  687,
  14,
  712,
  20,
  714,
  18,
  809,
  21,
  813,
  23,
  840,
  20,
  841,
  21,
  1198,
  19,
  1199,
  22,
  1226,
  18,
  1230,
  19,
  1325,
  23,
  1327,
  22,
  1352,
  15,
  1353,
  17,
  1354,
  15,
  1357,
  17,
  1358,
  16,
  1359,
  16,
  1360,
  11,
  1361,
  10,
  1362,
  11,
  1365,
  10,
  1366,
  9,
  1367,
  9,
  1392,
  11,
  1394,
  11,
  1489,
  10,
  1493,
  10,
  1520,
  8,
  1521,
  8,
  1878,
  9,
  1879,
  9,
  1906,
  7,
  1910,
  7,
  2005,
  6,
  2007,
  6,
  2032,
  8,
  2033,
  8,
  2034,
  7,
  2037,
  6,
  2038,
  7,
  2039,
  6,
];

const p3D = [
  0,
  0,
  1,
  -1,
  0,
  0,
  1,
  0,
  -1,
  0,
  0,
  -1,
  1,
  0,
  0,
  0,
  1,
  -1,
  0,
  0,
  -1,
  0,
  1,
  0,
  0,
  -1,
  1,
  0,
  2,
  1,
  1,
  0,
  1,
  1,
  1,
  -1,
  0,
  2,
  1,
  0,
  1,
  1,
  1,
  -1,
  1,
  0,
  2,
  0,
  1,
  1,
  1,
  -1,
  1,
  1,
  1,
  3,
  2,
  1,
  0,
  3,
  1,
  2,
  0,
  1,
  3,
  2,
  0,
  1,
  3,
  1,
  0,
  2,
  1,
  3,
  0,
  2,
  1,
  3,
  0,
  1,
  2,
  1,
  1,
  1,
  0,
  0,
  2,
  2,
  0,
  0,
  1,
  1,
  0,
  1,
  0,
  2,
  0,
  2,
  0,
  1,
  1,
  0,
  0,
  1,
  2,
  0,
  0,
  2,
  2,
  0,
  0,
  0,
  0,
  1,
  1,
  -1,
  1,
  2,
  0,
  0,
  0,
  0,
  1,
  -1,
  1,
  1,
  2,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  -1,
  2,
  3,
  1,
  1,
  1,
  2,
  0,
  0,
  2,
  2,
  3,
  1,
  1,
  1,
  2,
  2,
  0,
  0,
  2,
  3,
  1,
  1,
  1,
  2,
  0,
  2,
  0,
  2,
  1,
  1,
  -1,
  1,
  2,
  0,
  0,
  2,
  2,
  1,
  1,
  -1,
  1,
  2,
  2,
  0,
  0,
  2,
  1,
  -1,
  1,
  1,
  2,
  0,
  0,
  2,
  2,
  1,
  -1,
  1,
  1,
  2,
  0,
  2,
  0,
  2,
  1,
  1,
  1,
  -1,
  2,
  2,
  0,
  0,
  2,
  1,
  1,
  1,
  -1,
  2,
  0,
  2,
  0,
];
