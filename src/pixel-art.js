// The source atlas is 1448 × 1086. Rectangles are measured in source pixels.
// A separate rectangle per figure keeps the irregular sheet from leaking neighbors.
const ATLAS = new URL('../assets/pixel/fantasy-atlas.png', import.meta.url).href;
export const PIXEL_BACKGROUND = new URL('../assets/pixel/forest-ruins.png', import.meta.url).href;

const RECTS = Object.freeze({
  hero:    [16, 60, 380, 290],
  walker:  [405, 65, 300, 285],
  runner:  [740, 85, 320, 265],
  shield:  [1080, 25, 360, 325],
  spear:   [25, 380, 320, 325],
  bug:     [420, 395, 300, 270],
  drummer: [780, 410, 285, 285],
  healer:  [1090, 372, 350, 320],
  bomber:  [35, 750, 290, 305],
  boss1:   [335, 675, 395, 380],
  boss2:   [735, 695, 350, 360],
  boss3:   [1060, 695, 388, 360],
});

// The square span is only a layout box. Its ::before uses these variables to
// preserve the crop's aspect ratio and align the figure with the bottom edge.
// Position percentages refer to the free space around the scaled atlas image.
export function spriteStyle(type) {
  const [x, y, width, height] = RECTS[type] || RECTS.walker;
  const maxSide = Math.max(width, height);
  const sizeX = 1448 / width * 100;
  const sizeY = 1086 / height * 100;
  const posX = x / (1448 - width) * 100;
  const posY = y / (1086 - height) * 100;
  const clip = type === 'boss2'
    ? 'polygon(0 0,100% 0,100% 12%,94% 12%,94% 100%,0 100%)'
    : type === 'boss3'
      ? 'polygon(0 0,100% 0,100% 100%,5% 100%,5% 65%,0 65%)'
      : 'none';
  return `--sprite-image:url("${ATLAS}");--sprite-size:${sizeX}% ${sizeY}%;--sprite-position:${posX}% ${posY}%;--sprite-width:${width / maxSide * 100}%;--sprite-height:${height / maxSide * 100}%;--sprite-clip:${clip};`;
}
