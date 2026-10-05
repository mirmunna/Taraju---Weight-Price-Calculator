import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createPng(width, height, pixelFn) {
  // 1 filter byte per line + 4 bytes per pixel (RGBA)
  const lineLength = 1 + width * 4;
  const rawData = Buffer.alloc(lineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = Buffer.concat([
    Buffer.from('IHDR'),
    ihdr
  ]);
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(ihdrChunk), 0);
  const ihdrFull = Buffer.concat([
    Buffer.alloc(4), // length
    ihdrChunk,
    ihdrCrc
  ]);
  ihdrFull.writeUInt32BE(13, 0);

  // IDAT
  const idatChunk = Buffer.concat([
    Buffer.from('IDAT'),
    deflated
  ]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(idatChunk), 0);
  const idatFull = Buffer.concat([
    Buffer.alloc(4),
    idatChunk,
    idatCrc
  ]);
  idatFull.writeUInt32BE(deflated.length, 0);

  // IEND
  const iendChunk = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendChunk), 0);
  const iendFull = Buffer.concat([
    Buffer.alloc(4),
    iendChunk,
    iendCrc
  ]);
  iendFull.writeUInt32BE(0, 0);

  return Buffer.concat([signature, ihdrFull, idatFull, iendFull]);
}

// Draw a crisp graphic with scale beam, dual pans, and emerald green gradient
function drawTaraju(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background
  const bgR = Math.round(4 + (ny * 6));
  const bgG = Math.round(120 - (ny * 25));
  const bgB = Math.round(87 - (ny * 17));

  // Rounded corners if not maskable
  if (!isMaskable) {
    const rx = 0.2;
    const corner = (px, py) => {
      const dx = Math.max(0, Math.abs(px - 0.5) - (0.5 - rx));
      const dy = Math.max(0, Math.abs(py - 0.5) - (0.5 - rx));
      return Math.sqrt(dx * dx + dy * dy) <= rx;
    };
    if (!corner(nx, ny)) {
      return [0, 0, 0, 0];
    }
  }

  // Draw Central Column
  if (Math.abs(nx - 0.5) < 0.025 && ny >= 0.24 && ny <= 0.76) {
    return [241, 245, 249, 255]; // Metal White/Silver
  }

  // Draw Base
  if (ny >= 0.72 && ny <= 0.79) {
    const baseW = 0.18 * (1 - (ny - 0.72) / 0.14);
    if (Math.abs(nx - 0.5) < baseW) {
      return [203, 213, 225, 255];
    }
  }

  // Draw Balance Beam
  if (ny >= 0.28 && ny <= 0.32 && Math.abs(nx - 0.5) < 0.33) {
    return [248, 250, 252, 255];
  }

  // Central Pivot circle
  const distCenter = Math.hypot(nx - 0.5, ny - 0.3);
  if (distCenter < 0.045) {
    if (distCenter < 0.018) return [255, 255, 255, 255];
    return [239, 68, 68, 255]; // Red pivot
  }

  // Left string
  const leftX = 0.24;
  if (ny >= 0.31 && ny <= 0.52) {
    const stringX1 = 0.22 + (ny - 0.31) * (-0.08 / 0.21);
    const stringX2 = 0.26 + (ny - 0.31) * (0.08 / 0.21);
    if (Math.abs(nx - stringX1) < 0.007 || Math.abs(nx - stringX2) < 0.007) {
      return [241, 245, 249, 255];
    }
  }

  // Left Pan (Gold - ₹ currency)
  const leftPanDist = Math.hypot((nx - leftX) / 0.12, (ny - 0.52) / 0.08);
  if (leftPanDist <= 1.0 && ny >= 0.52) {
    return [251, 191, 36, 255];
  }

  // Right string
  const rightX = 0.76;
  if (ny >= 0.31 && ny <= 0.52) {
    const stringX1 = 0.74 + (ny - 0.31) * (-0.08 / 0.21);
    const stringX2 = 0.78 + (ny - 0.31) * (0.08 / 0.21);
    if (Math.abs(nx - stringX1) < 0.007 || Math.abs(nx - stringX2) < 0.007) {
      return [241, 245, 249, 255];
    }
  }

  // Right Pan (Blue/Cyan - kg weight)
  const rightPanDist = Math.hypot((nx - rightX) / 0.12, (ny - 0.52) / 0.08);
  if (rightPanDist <= 1.0 && ny >= 0.52) {
    return [56, 189, 248, 255];
  }

  // Subtle inner border ring
  if (!isMaskable) {
    if (nx > 0.04 && nx < 0.96 && ny > 0.04 && ny < 0.96) {
      if (Math.abs(nx - 0.04) < 0.005 || Math.abs(nx - 0.96) < 0.005 ||
          Math.abs(ny - 0.04) < 0.005 || Math.abs(ny - 0.96) < 0.005) {
        return [52, 211, 153, 100];
      }
    }
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => drawTaraju(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => drawTaraju(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => drawTaraju(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => drawTaraju(x, y, w, h, false)));

console.log('Successfully generated PWA PNG icons!');
