export function hexToRgb(hex,alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null; // Invalid HEX format
  const [, r, g, b] = result;
  return {
    rgb: alpha < 1.00 ? `(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)},${alpha})` : `(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)} )`,
    r,g,b,a: alpha*100
  };
}

export function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null; // Invalid HEX format
  const [, r, g, b] = result;
  const hsl = {};

  // Convert HEX to RGB (0-255)
  hsl.r = parseInt(r, 16) / 255;
  hsl.g = parseInt(g, 16) / 255;
  hsl.b = parseInt(b, 16) / 255;

  // Calculate HSL values
  const max = Math.max(hsl.r, hsl.g, hsl.b);
  const min = Math.min(hsl.r, hsl.g, hsl.b);
  hsl.l = (max + min) / 2;

  if (max === min) {
    hsl.h = 0; // No saturation, grayscale
  } else {
    const d = max - min;
    hsl.s = hsl.l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case hsl.r:
        hsl.h = (hsl.g - hsl.b) / d + (hsl.g < hsl.b ? 6 : 0);
        break;
      case hsl.g:
        hsl.h = (hsl.b - hsl.r) / d + 2;
        break;
      case hsl.b:
        hsl.h = (hsl.r - hsl.g) / d + 4;
        break;
    }
    hsl.h *= 60; // Convert to degrees
  }

  // Round HSL values and return
  hsl.h = Math.round(hsl.h);
  hsl.s = Math.round(hsl.s * 100);
  hsl.l = Math.round(hsl.l * 100);

  return hsl;
}
