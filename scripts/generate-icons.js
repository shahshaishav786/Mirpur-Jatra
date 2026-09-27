import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create Brand SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#b45309" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)" />
  <circle cx="256" cy="220" r="190" fill="url(#sunGlow)" />

  <!-- Temple Shikhara / Dhwaja Emblem -->
  <g filter="url(#shadow)" transform="translate(0, 10)">
    <!-- Flag / Dhwaja -->
    <path d="M256 90 L295 110 L256 130 Z" fill="#fef08a" />
    <line x1="256" y1="85" x2="256" y2="145" stroke="#fef08a" stroke-width="6" stroke-linecap="round" />

    <!-- Kalash / Finial -->
    <ellipse cx="256" cy="148" rx="14" ry="10" fill="url(#goldGrad)" />
    <circle cx="256" cy="138" r="6" fill="#fef08a" />

    <!-- Main Temple Shikhara (Dome/Tower) -->
    <path d="M256 155 Q295 240 325 295 L187 295 Q217 240 256 155 Z" fill="url(#goldGrad)" />
    <path d="M256 160 Q280 235 298 290 L214 290 Q232 235 256 160 Z" fill="#ffffff" opacity="0.2" />

    <!-- Temple Base Sanctum -->
    <rect x="166" y="295" width="180" height="35" rx="6" fill="#ffffff" />
    <rect x="176" y="303" width="160" height="19" rx="3" fill="url(#goldGrad)" opacity="0.9" />

    <!-- Pillars -->
    <rect x="180" y="330" width="18" height="55" rx="3" fill="#ffffff" />
    <rect x="216" y="330" width="18" height="55" rx="3" fill="#ffffff" />
    <rect x="278" y="330" width="18" height="55" rx="3" fill="#ffffff" />
    <rect x="314" y="330" width="18" height="55" rx="3" fill="#ffffff" />

    <!-- Arch Doorway -->
    <path d="M238 385 L238 350 Q256 335 274 350 L274 385 Z" fill="#92400e" />

    <!-- Base Plinth Steps -->
    <rect x="150" y="385" width="212" height="14" rx="4" fill="#ffffff" />
    <rect x="136" y="399" width="240" height="16" rx="4" fill="#fef08a" />
  </g>

  <!-- Sacred Decorative Lotus Curve -->
  <path d="M120 410 Q256 460 392 410 Q256 485 120 410 Z" fill="#ffffff" opacity="0.35" />

  <!-- App Title Acronym / Sacred Text -->
  <text x="256" y="468" text-anchor="middle" font-family="'Noto Sans Gujarati', sans-serif, system-ui" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="1">પ્રેમ સમરથ પરિવાર</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

// Minimal pure Node PNG builder (PNG signature + IHDR + IDAT with deflateSync + IEND)
function createPngBuffer(width, height, getPixelRgba) {
  // 1. PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC Table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);
    const crc = crc32(chunk.subarray(4, 8 + len));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  // 2. IHDR Chunk (13 bytes)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace 0
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // 3. IDAT Raw Scanlines
  // Each scanline starts with filter byte 0 (None), followed by width * 4 bytes
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // 4. IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Function to draw pixel for brand icon
function getBrandPixel(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background gradient: from deep amber #b45309 (180, 83, 9) to golden amber #f59e0b (245, 158, 11)
  const bgR = Math.round(180 + (245 - 180) * ((nx + ny) / 2));
  const bgG = Math.round(83 + (158 - 83) * ((nx + ny) / 2));
  const bgB = Math.round(9 + (11 - 9) * ((nx + ny) / 2));

  if (!isMaskable) {
    // Rounded corners for standard icon
    const cornerRadius = w * 0.22;
    const isCorner =
      (x < cornerRadius && y < cornerRadius && Math.hypot(x - cornerRadius, y - cornerRadius) > cornerRadius) ||
      (x > w - cornerRadius && y < cornerRadius && Math.hypot(x - (w - cornerRadius), y - cornerRadius) > cornerRadius) ||
      (x < cornerRadius && y > h - cornerRadius && Math.hypot(x - cornerRadius, y - (h - cornerRadius)) > cornerRadius) ||
      (x > w - cornerRadius && y > h - cornerRadius && Math.hypot(x - (w - cornerRadius), y - (h - cornerRadius)) > cornerRadius);

    if (isCorner) {
      return [0, 0, 0, 0]; // Transparent
    }
  }

  // Draw Temple / Kalash Motif in center
  const scale = isMaskable ? 0.65 : 0.82; // Safe zone for maskable icon
  const cx = 0.5;
  const cy = 0.5;
  const px = (nx - cx) / scale;
  const py = (ny - cy) / scale;

  // Shikhara dome (curved triangle)
  if (py >= -0.32 && py <= 0.08) {
    const halfWidth = 0.04 + 0.30 * Math.pow((py + 0.32) / 0.40, 1.4);
    if (Math.abs(px) <= halfWidth) {
      return [254, 240, 138, 255]; // Golden yellow #fef08a
    }
  }

  // Flag and Kalash
  if (py >= -0.42 && py < -0.32) {
    if (Math.abs(px) <= 0.015) return [255, 255, 255, 255]; // Pole
    if (px >= 0 && px <= 0.12 && py <= -0.36) return [254, 240, 138, 255]; // Flag
    if (Math.abs(px) <= 0.04 && py >= -0.36) return [251, 191, 36, 255]; // Kalash
  }

  // Sanctum / Pillars
  if (py > 0.08 && py <= 0.26) {
    if (Math.abs(px) <= 0.32) {
      // Pillars
      const pillarDist = Math.abs(px);
      if (pillarDist <= 0.07) {
        // Doorway
        return [146, 64, 14, 255]; // #92400e
      }
      if ((pillarDist >= 0.12 && pillarDist <= 0.17) || (pillarDist >= 0.24 && pillarDist <= 0.29)) {
        return [255, 255, 255, 255]; // White pillars
      }
      return [217, 119, 6, 255]; // Inner warm color
    }
  }

  // Temple Base Plinth
  if (py > 0.26 && py <= 0.36) {
    if (Math.abs(px) <= 0.38) {
      return [255, 255, 255, 255];
    }
  }

  // Lotus curved base line
  if (py > 0.36 && py <= 0.43) {
    const lotusCurve = Math.pow(px / 0.42, 2) * 0.06;
    if (Math.abs(px) <= 0.42 && py <= 0.37 + lotusCurve) {
      return [254, 243, 199, 220];
    }
  }

  return [bgR, bgG, bgB, 255];
}

// Generate PNG files
console.log('Generating PWA icons...');
const pwa192 = createPngBuffer(192, 192, (x, y, w, h) => getBrandPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

const pwa512 = createPngBuffer(512, 512, (x, y, w, h) => getBrandPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

const pwaMaskable = createPngBuffer(512, 512, (x, y, w, h) => getBrandPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

const appleTouchIcon = createPngBuffer(180, 180, (x, y, w, h) => getBrandPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);

// Favicon ico placeholder (or copy 192 png)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), appleTouchIcon);

console.log('PWA icons created successfully in /public!');
