/** 픽셀 그림을 그리는 도구. 그림 파일 없이 작은 캔버스에 칸 단위로 그리고, 바깥선을 자동으로 두른다. */

export interface Sprite {
  img: HTMLCanvasElement;
  /** 바깥선을 뺀 그림 크기 */
  w: number;
  h: number;
  /** 바깥선 때문에 둘레에 더한 칸 */
  pad: number;
}

/** 바깥선 색. 검정 대신 짙은 자주색을 써서 밤 장면에 섞이게 한다 */
export const INK = '#2a1a2e';
export const FONT = "12px 'Galmuri11'";

export class Pen {
  constructor(readonly ctx: CanvasRenderingContext2D) {}

  rect(x: number, y: number, w: number, h: number, color: string): void {
    if (w <= 0 || h <= 0) return;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  px(x: number, y: number, color: string): void {
    this.rect(x, y, 1, 1, color);
  }

  /** 가운데 (cx, cy), 반지름 rx·ry인 타원. 줄 단위로 채워서 흐린 가장자리가 생기지 않는다 */
  ellipse(cx: number, cy: number, rx: number, ry: number, color: string): void {
    for (let dy = -ry; dy <= ry; dy += 1) {
      const t = dy / (ry + 0.5);
      const half = Math.round(rx * Math.sqrt(1 - t * t));
      this.rect(cx - half, cy + dy, half * 2 + 1, 1, color);
    }
  }

  erase(x: number, y: number, w: number, h: number): void {
    this.ctx.clearRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  blit(sprite: Sprite, x: number, y: number): void {
    this.ctx.drawImage(sprite.img, Math.round(x) - sprite.pad, Math.round(y) - sprite.pad);
  }
}

function canvasOf(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const img = document.createElement('canvas');
  img.width = Math.max(1, w);
  img.height = Math.max(1, h);
  const ctx = img.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  return [img, ctx];
}

/** 그림 둘레의 빈 칸 가운데 그림과 맞닿은 칸을 선 색으로 칠한다 */
function addOutline(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 0;
  const edge: number[] = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) edge.push(x, y);
    }
  }
  ctx.fillStyle = color;
  for (let i = 0; i < edge.length; i += 2) ctx.fillRect(edge[i], edge[i + 1], 1, 1);
}

export function makeSprite(w: number, h: number, draw: (pen: Pen) => void, outline?: string): Sprite {
  const pad = outline ? 1 : 0;
  const [img, ctx] = canvasOf(w + pad * 2, h + pad * 2);
  ctx.translate(pad, pad);
  draw(new Pen(ctx));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (outline) addOutline(ctx, img.width, img.height, outline);
  return { img, w, h, pad };
}

/** 글꼴을 이 배수로 크게 그린 뒤 칸 가운데만 읽는다. 작은 크기로 바로 그리면 획이 흐려져서 끊긴다 */
const TEXT_ZOOM = 4;

/** 픽셀 글꼴로 쓴 글. 늘려도 또렷하다 */
export function textSprite(text: string, color: string, outline?: string): Sprite {
  const rows = 13;
  const [big, bigCtx] = canvasOf(1, 1);
  bigCtx.font = FONT;
  const width = Math.max(1, Math.ceil(bigCtx.measureText(text).width));
  big.width = width * TEXT_ZOOM;
  big.height = rows * TEXT_ZOOM;
  bigCtx.font = FONT.replace('12px', `${12 * TEXT_ZOOM}px`);
  bigCtx.textBaseline = 'alphabetic';
  bigCtx.fillText(text, 0, 11 * TEXT_ZOOM);
  const source = bigCtx.getImageData(0, 0, big.width, big.height).data;
  const half = TEXT_ZOOM / 2;
  return makeSprite(
    width,
    rows,
    (pen) => {
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const alpha = source[((y * TEXT_ZOOM + half) * big.width + x * TEXT_ZOOM + half) * 4 + 3];
          if (alpha > 128) pen.px(x, y, color);
        }
      }
    },
    outline,
  );
}

export function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, flip = false): void {
  const left = Math.round(x);
  const top = Math.round(y);
  if (!flip) {
    ctx.drawImage(sprite.img, left - sprite.pad, top - sprite.pad);
    return;
  }
  ctx.save();
  ctx.translate(left + sprite.w, top);
  ctx.scale(-1, 1);
  ctx.drawImage(sprite.img, -sprite.pad, -sprite.pad);
  ctx.restore();
}

/** 겹쳐 그리면 밝아지는 빛. 띠 세 겹으로 번지게 한다 */
export function makeGlow(radius: number, color: string): Sprite {
  const size = radius * 2 + 1;
  return makeSprite(size, size, (pen) => {
    pen.ctx.globalAlpha = 0.1;
    pen.ellipse(radius, radius, radius, radius, color);
    pen.ctx.globalAlpha = 0.12;
    pen.ellipse(radius, radius, Math.round(radius * 0.66), Math.round(radius * 0.66), color);
    pen.ctx.globalAlpha = 0.2;
    pen.ellipse(radius, radius, Math.round(radius * 0.33), Math.round(radius * 0.33), color);
    pen.ctx.globalAlpha = 1;
  });
}

/** 같은 씨앗이면 늘 같은 순서로 나오는 난수 */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 색을 어둡게(amount < 0) 또는 밝게(amount > 0) 섞는다 */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * k);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
