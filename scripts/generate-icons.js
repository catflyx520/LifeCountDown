const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const BG     = '#eadfc3';
const FG     = '#3a2e1e';
const ACCENT = '#b5533c';

// Full icon with rounded-rect background (for icon.png)
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="28" fill="${BG}"/>
  <rect x="28" y="22" width="64" height="5" rx="2" fill="${FG}"/>
  <rect x="28" y="93" width="64" height="5" rx="2" fill="${FG}"/>
  <clipPath id="ct"><path d="M33 27 L87 27 L63 58 L57 58 Z"/></clipPath>
  <clipPath id="cb"><path d="M57 62 L63 62 L87 93 L33 93 Z"/></clipPath>
  <rect x="0" y="34" width="120" height="40" fill="${ACCENT}" clip-path="url(#ct)"/>
  <path d="M33 27 L87 27 L63 58 L57 58 Z" stroke="${FG}" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <rect x="0" y="78" width="120" height="30" fill="${ACCENT}" clip-path="url(#cb)"/>
  <path d="M57 62 L63 62 L87 93 L33 93 Z" stroke="${FG}" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <circle cx="60" cy="65" r="1.8" fill="${ACCENT}"/>
  <circle cx="60" cy="72" r="1.4" fill="${ACCENT}" opacity="0.7"/>
  <rect x="56" y="56" width="8" height="8" fill="${BG}"/>
</svg>`;

// Foreground only, centered with padding (for adaptive-icon.png and splash-icon.png)
function foregroundSvg(size, pad) {
  const inner = size - pad * 2;
  const scale = inner / 120;
  const tx = pad;
  const ty = pad;
  return `
<svg width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${tx},${ty}) scale(${scale})">
    <rect x="28" y="22" width="64" height="5" rx="2" fill="${FG}"/>
    <rect x="28" y="93" width="64" height="5" rx="2" fill="${FG}"/>
    <clipPath id="ct"><path d="M33 27 L87 27 L63 58 L57 58 Z"/></clipPath>
    <clipPath id="cb"><path d="M57 62 L63 62 L87 93 L33 93 Z"/></clipPath>
    <rect x="0" y="34" width="120" height="40" fill="${ACCENT}" clip-path="url(#ct)"/>
    <path d="M33 27 L87 27 L63 58 L57 58 Z" stroke="${FG}" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <rect x="0" y="78" width="120" height="30" fill="${ACCENT}" clip-path="url(#cb)"/>
    <path d="M57 62 L63 62 L87 93 L33 93 Z" stroke="${FG}" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <circle cx="60" cy="65" r="1.8" fill="${ACCENT}"/>
    <circle cx="60" cy="72" r="1.4" fill="${ACCENT}" opacity="0.7"/>
  </g>
</svg>`;
}

function renderPng(svg, outPath) {
  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();
  fs.writeFileSync(outPath, png);
  console.log(`✓ ${path.relative(process.cwd(), outPath)}`);
}

// White notification icon (transparent bg, white hourglass — Android requirement)
function notificationSvg(size, pad) {
  const inner = size - pad * 2;
  const scale = inner / 120;
  return `
<svg width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(${pad},${pad}) scale(${scale})">
    <rect x="28" y="22" width="64" height="5" rx="2" fill="white"/>
    <rect x="28" y="93" width="64" height="5" rx="2" fill="white"/>
    <clipPath id="ct"><path d="M33 27 L87 27 L63 58 L57 58 Z"/></clipPath>
    <clipPath id="cb"><path d="M57 62 L63 62 L87 93 L33 93 Z"/></clipPath>
    <rect x="0" y="34" width="120" height="40" fill="white" clip-path="url(#ct)"/>
    <path d="M33 27 L87 27 L63 58 L57 58 Z" stroke="white" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <rect x="0" y="78" width="120" height="30" fill="white" clip-path="url(#cb)"/>
    <path d="M57 62 L63 62 L87 93 L33 93 Z" stroke="white" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <circle cx="60" cy="65" r="1.8" fill="white"/>
    <circle cx="60" cy="72" r="1.4" fill="white" opacity="0.7"/>
  </g>
</svg>`;
}

const assets = path.join(__dirname, '..', 'assets');

renderPng(iconSvg,                         path.join(assets, 'icon.png'));
renderPng(foregroundSvg(1024, 154),        path.join(assets, 'adaptive-icon.png'));
renderPng(foregroundSvg(200, 30),          path.join(assets, 'splash-icon.png'));
renderPng(foregroundSvg(48, 6),            path.join(assets, 'favicon.png'));
renderPng(notificationSvg(96, 12),         path.join(assets, 'notification-icon.png'));

console.log('\nDone — rebuild the app to see new icons.');
