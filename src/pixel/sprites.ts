/** 박람회장에 나오는 그림. 전부 코드로 칸을 찍어 만든다. */
import type { BowlSpec, Topping } from '../data/menu';
import { INK, Pen, makeSprite, seeded, shade, textSprite, type Sprite } from './paint';

export const CREAM = '#f6eedb';
const WOOD = '#a86a3c';
const WOOD_LIGHT = '#d19a5b';
const WOOD_DARK = '#74452b';
const SKIN = '#f3c59b';
const BLUSH = '#ee917f';

/* ── 사람 ── */

export interface Look {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoe: string;
  /** 목에 건 입장권 */
  pass?: boolean;
  /** 모자 색 */
  cap?: string;
  /** 뒤로 묶은 머리 */
  tail?: boolean;
}

export const PLAYER_LOOK: Look = { skin: SKIN, hair: '#4a2f27', top: '#f2b632', bottom: '#34406b', shoe: '#f6eedb', pass: true };

export const VISITOR_LOOKS: Look[] = [
  { skin: SKIN, hair: '#2c2230', top: '#6fb7a8', bottom: '#4a3a5c', shoe: '#2c2230', tail: true },
  { skin: '#e2ab82', hair: '#6b3f2a', top: '#c9a25a', bottom: '#3a4a6b', shoe: '#f6eedb', cap: '#3a4a6b' },
  { skin: SKIN, hair: '#c98a4f', top: '#f6eedb', bottom: '#8a4a5c', shoe: '#2c2230' },
  { skin: '#d79a72', hair: '#2c2230', top: '#8f7fd1', bottom: '#2f3a4a', shoe: '#f6eedb', tail: true },
  { skin: SKIN, hair: '#3a2a26', top: '#7fb0e0', bottom: '#5c4a3a', shoe: '#2c2230', cap: '#2f3f7a' },
];

export const CHAR_W = 18;
export const CHAR_H = 25;

interface Pose {
  /** 0·2는 다리를 벌린 걸음, 1·3은 다리를 모은 걸음 */
  step: number;
  walking: boolean;
  mouthOpen?: boolean;
  /** 그릇을 든 팔 */
  holding?: boolean;
  blink?: boolean;
}

/** 오른쪽을 보는 사람 한 장 */
function paintWalker(pen: Pen, look: Look, pose: Pose): void {
  const far = shade(look.bottom, -0.25);
  const topShade = shade(look.top, -0.18);
  const lift = pose.walking && pose.step % 2 === 1 ? -1 : 0; // 다리를 모을 때 몸이 한 칸 올라간다
  const y = lift + 1;

  // 다리 — 먼 다리를 먼저 그린다
  const spread = pose.walking && pose.step % 2 === 0;
  const swap = pose.step === 2;
  const backX = spread ? 4 : 6;
  const frontX = spread ? 11 : 9;
  const leg = (x: number, color: string, raised: boolean) => {
    pen.rect(x, 19, 3, raised ? 3 : 4, color);
    pen.rect(x, raised ? 22 : 23, 4, 2, look.shoe);
  };
  leg(swap ? frontX : backX, far, spread && swap);
  leg(swap ? backX : frontX, look.bottom, spread && !swap);

  // 몸
  pen.rect(5, 11 + y, 9, 8, look.top);
  pen.rect(5, 17 + y, 9, 2, topShade);
  pen.rect(4, 12 + y, 1, 5, look.top);
  if (look.pass) {
    pen.px(9, 11 + y, '#2f3f7a');
    pen.px(10, 12 + y, '#2f3f7a');
    pen.rect(10, 13 + y, 3, 3, CREAM);
    pen.px(11, 14 + y, '#2f3f7a');
  }

  // 팔
  if (pose.holding) {
    pen.rect(8, 13 + y, 6, 2, topShade);
    pen.rect(14, 13 + y, 2, 2, look.skin);
  } else {
    const swing = pose.walking && pose.step % 2 === 0 ? (swap ? 2 : -2) : 0;
    pen.rect(8 + swing, 12 + y, 3, 5, topShade);
    pen.rect(8 + swing, 17 + y, 3, 1, look.skin);
  }

  // 머리
  const h = y - 1;
  pen.rect(4, 0 + h, 10, 1, look.hair);
  pen.rect(3, 1 + h, 12, 2, look.hair);
  pen.rect(2, 3 + h, 13, 7, look.hair);
  pen.rect(3, 10 + h, 4, 2, look.hair);
  if (look.tail) pen.rect(0, 5 + h, 2, 5, look.hair);
  pen.rect(7, 5 + h, 9, 5, look.skin);
  pen.rect(8, 10 + h, 7, 1, look.skin);
  pen.rect(6, 6 + h, 1, 3, look.skin);
  pen.rect(7, 3 + h, 8, 2, look.hair);
  pen.px(15, 4 + h, look.hair);
  if (look.cap) {
    pen.rect(3, 0 + h, 12, 3, look.cap);
    pen.rect(4, -1 + h + 1, 10, 1, look.cap);
    pen.rect(11, 3 + h, 7, 1, shade(look.cap, -0.2));
  }
  // 얼굴
  if (pose.blink) {
    pen.rect(10, 8 + h, 2, 1, INK);
    pen.rect(13, 8 + h, 2, 1, INK);
  } else {
    pen.rect(10, 6 + h, 1, 3, INK);
    pen.rect(14, 6 + h, 1, 3, INK);
    pen.px(10, 6 + h, '#5a4a66');
    pen.px(14, 6 + h, '#5a4a66');
  }
  pen.px(8, 9 + h, BLUSH);
  pen.px(9, 9 + h, BLUSH);
  if (pose.mouthOpen) pen.rect(12, 9 + h, 2, 2, '#8a2f2a');
  else pen.px(12, 10 + h, '#8a2f2a');
}

export interface WalkerSprites {
  idle: Sprite[];
  walk: Sprite[];
  eat: Sprite[];
}

export function makeWalker(look: Look): WalkerSprites {
  const one = (pose: Pose) => makeSprite(CHAR_W, CHAR_H, (pen) => paintWalker(pen, look, pose), INK);
  return {
    idle: [one({ step: 0, walking: false }), one({ step: 0, walking: false, blink: true })],
    walk: [0, 1, 2, 3].map((step) => one({ step, walking: true })),
    eat: [one({ step: 0, walking: false, holding: true, mouthOpen: true }), one({ step: 0, walking: false, holding: true, blink: true })],
  };
}

export const VENDOR_W = 16;
export const VENDOR_H = 19;

/** 계산대 뒤에 선 부스 지기. 정면을 보고 윗몸만 그린다 */
export function makeVendor(apron: string, hair: string, skin: string): Sprite[] {
  const paint = (pen: Pen, blink: boolean, wave: boolean) => {
    pen.rect(3, 0, 10, 1, hair);
    pen.rect(2, 1, 12, 2, hair);
    pen.rect(1, 3, 14, 6, hair);
    pen.rect(3, 5, 10, 6, skin);
    pen.rect(4, 11, 8, 1, skin);
    pen.rect(3, 4, 10, 1, hair);
    // 머리띠
    pen.rect(1, 2, 14, 2, CREAM);
    pen.rect(7, 2, 2, 2, '#2f3f7a');
    if (blink) {
      pen.rect(5, 8, 2, 1, INK);
      pen.rect(9, 8, 2, 1, INK);
    } else {
      pen.rect(5, 7, 1, 2, INK);
      pen.rect(10, 7, 1, 2, INK);
    }
    pen.px(4, 9, BLUSH);
    pen.px(11, 9, BLUSH);
    pen.rect(7, 10, 2, 1, '#8a2f2a');
    // 어깨와 앞치마
    pen.rect(1, 13, 14, 6, CREAM);
    pen.rect(6, 12, 4, 1, skin);
    pen.rect(4, 13, 8, 6, apron);
    pen.rect(4, 13, 1, 2, shade(apron, -0.2));
    pen.rect(11, 13, 1, 2, shade(apron, -0.2));
    if (wave) {
      pen.rect(14, 8, 2, 5, CREAM);
      pen.rect(14, 6, 2, 2, skin);
    }
  };
  return [
    makeSprite(VENDOR_W, VENDOR_H, (pen) => paint(pen, false, false), INK),
    makeSprite(VENDOR_W, VENDOR_H, (pen) => paint(pen, true, false), INK),
    makeSprite(VENDOR_W, VENDOR_H, (pen) => paint(pen, false, true), INK),
  ];
}

export function makeCat(): Sprite[] {
  const fur = '#eda65a';
  const dark = '#c9793a';
  const paint = (pen: Pen, tailUp: boolean) => {
    pen.ellipse(6, 7, 5, 3, fur);
    pen.rect(2, 9, 9, 2, fur);
    // 머리
    pen.rect(8, 1, 6, 5, fur);
    pen.px(8, 0, fur);
    pen.px(13, 0, fur);
    pen.px(10, 3, INK);
    pen.px(12, 3, INK);
    pen.px(11, 4, '#e98a8a');
    pen.rect(3, 5, 3, 1, dark);
    pen.rect(4, 7, 3, 1, dark);
    // 꼬리
    if (tailUp) pen.rect(0, 3, 2, 6, fur);
    else {
      pen.rect(0, 8, 2, 2, fur);
      pen.rect(-1 + 1, 6, 1, 2, fur);
    }
  };
  return [makeSprite(14, 11, (pen) => paint(pen, false), INK), makeSprite(14, 11, (pen) => paint(pen, true), INK)];
}

/* ── 국수 그릇 ── */

function paintTopping(pen: Pen, kind: Topping, x: number, y: number, big: boolean): void {
  const k = big ? 2 : 1;
  switch (kind) {
    case 'egg':
      pen.ellipse(x, y, k + 1, k, '#fffaf0');
      pen.rect(x - (big ? 1 : 0), y - (big ? 1 : 0), k, k, '#f2b632');
      break;
    case 'scallion':
      pen.rect(x - k, y, k, 1, '#4f9a45');
      pen.rect(x + 1, y - 1, k, 1, '#6fc05a');
      pen.px(x, y + 1, '#6fc05a');
      break;
    case 'gim':
      pen.rect(x - k, y - k * 2, k * 2, k * 2 + 1, '#22302a');
      pen.px(x - k, y - k * 2, '#3a4f44');
      break;
    case 'chili':
      pen.rect(x, y, k, 1, '#d6402b');
      pen.px(x - 2, y + 1, '#d6402b');
      pen.px(x + k + 1, y - 1, '#e8573c');
      break;
    case 'cucumber':
      pen.rect(x - k - 1, y, k * 2 + 2, 1, '#a9d67c');
      pen.rect(x - k, y - 1, k * 2, 1, '#5f9a4a');
      break;
    case 'kimchi':
      pen.ellipse(x, y, k + 1, k, '#d9532c');
      pen.px(x, y - (big ? 1 : 0), '#f39a6b');
      break;
    case 'sesame':
      pen.px(x - 2, y, '#fbf1c9');
      pen.px(x + 1, y - 1, '#fbf1c9');
      pen.px(x + 2, y + 1, '#fbf1c9');
      break;
    case 'zucchini':
      pen.rect(x - k, y - 1, k * 2 + 1, 2, '#d6e8a0');
      pen.rect(x - k, y - 1, k * 2 + 1, 1, '#6f9a4a');
      break;
    case 'fishcake':
      pen.ellipse(x, y, k + 1, k, '#fffaf0');
      pen.px(x, y, '#f08aa0');
      if (big) pen.px(x + 1, y - 1, '#f08aa0');
      break;
    case 'ice':
      pen.rect(x - k, y - k, k + 1, k + 1, '#d5eefa');
      pen.px(x - k, y - k, '#ffffff');
      break;
    case 'sauce':
      pen.ellipse(x, y - 1, k + 1, k, '#a8281c');
      pen.px(x, y - 1 - (big ? 1 : 0), '#d6402b');
      break;
  }
}

/** 국수 그릇. r은 그릇 입의 반지름이고, 그림 크기는 (2r+1) × bowlHeight(r) */
export const bowlHeight = (r: number) => Math.round(r * 0.9) + Math.round(r * 0.36) + 8;

export function makeBowl(spec: BowlSpec, r: number, band: string): Sprite {
  const big = r >= 12;
  const rimRy = Math.max(2, Math.round(r * 0.3));
  const bodyH = Math.round(r * 0.9);
  const top = 6; // 그릇 입 위로 국수가 올라올 자리
  return makeSprite(
    r * 2 + 1,
    bowlHeight(r),
    (pen) => {
      const cx = r;
      const cy = top + rimRy;
      const body = '#fbf6ea';
      const bodyShade = '#d8cdb8';
      // 그릇 몸
      for (let dy = 0; dy <= bodyH; dy += 1) {
        const t = dy / bodyH;
        const half = Math.round(r * Math.sqrt(1 - t * t * 0.8));
        pen.rect(cx - half, cy + dy, half * 2 + 1, 1, body);
        pen.rect(cx + Math.round(half * 0.45), cy + dy, half - Math.round(half * 0.45) + 1, 1, bodyShade);
      }
      const bandY = cy + Math.round(bodyH * 0.45);
      const bandHalf = Math.round(r * Math.sqrt(1 - 0.45 * 0.45 * 0.8));
      pen.rect(cx - bandHalf, bandY, bandHalf * 2 + 1, big ? 2 : 1, band);
      const foot = Math.round(r * 0.4);
      pen.rect(cx - foot, cy + bodyH + 1, foot * 2 + 1, 1, bodyShade);
      // 그릇 입과 국물
      pen.ellipse(cx, cy, r, rimRy, '#ffffff');
      pen.ellipse(cx, cy, r - 1, rimRy - 1, spec.broth);
      pen.ellipse(cx - 1, cy, r - 3, Math.max(1, rimRy - 2), shade(spec.broth, 0.12));
      // 국수 더미
      const moundRx = Math.round(r * 0.62);
      const moundRy = Math.max(2, rimRy);
      pen.ellipse(cx, cy - 2, moundRx, moundRy, spec.noodle);
      const strand = shade(spec.noodle, -0.22);
      const rand = seeded(r * 31 + spec.toppings.length * 7 + spec.broth.charCodeAt(2));
      for (let i = 0; i < (big ? 7 : 4); i += 1) {
        const sx = cx - moundRx + 2 + Math.floor(rand() * (moundRx * 2 - 4));
        const sy = cy - 2 - moundRy + 1 + Math.floor(rand() * (moundRy * 2 - 1));
        pen.rect(sx, sy, big ? 3 : 2, 1, strand);
      }
      pen.rect(cx - moundRx + 2, cy - 2 - moundRy, big ? 4 : 2, 1, shade(spec.noodle, 0.3));
      // 고명
      const count = spec.toppings.length;
      spec.toppings.forEach((kind, i) => {
        const spread = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
        const tx = cx + Math.round(spread * moundRx * 0.7);
        const ty = cy - 3 - (i % 2 === 0 ? 0 : big ? 2 : 1);
        paintTopping(pen, kind, tx, ty, big);
      });
    },
    INK,
  );
}

/* ── 부스 ── */

export const BOOTH = {
  /** 그림의 왼쪽 끝이 부스 가운데에서 떨어진 거리 */
  half: 52,
  /** 그림의 높이. 바닥에서 지붕 위 그릇 받침까지 */
  height: 88,
  counterTop: 22,
  roofTop: 86,
};

export interface BoothArt {
  /** 계산대 뒤 — 기둥, 안쪽 벽, 차양, 간판 */
  back: Sprite;
  /** 계산대와 그 위에 놓인 것 */
  front: Sprite;
}

export function makeBooth(name: string, dish: string, color: string, counterBowl: Sprite | null): BoothArt {
  const W = BOOTH.half * 2;
  const H = BOOTH.height;
  const Y = (up: number) => H - up; // 바닥에서 위로 잰 높이를 그림 좌표로
  const X = (dx: number) => BOOTH.half + dx;
  const stripe = CREAM;
  const dark = shade(color, -0.28);

  const back = makeSprite(
    W,
    H,
    (pen) => {
      // 안쪽 벽과 선반
      pen.rect(X(-43), Y(54), 86, 54, '#5d3428');
      pen.rect(X(-43), Y(54), 86, 6, '#4a281f');
      pen.rect(X(-43), Y(30), 86, 8, '#6f4030');
      pen.rect(X(-38), Y(44), 30, 1, WOOD_DARK);
      pen.rect(X(10), Y(44), 28, 1, WOOD_DARK);
      const jars = ['#f2b632', '#2f3f7a', '#6fb7a8', CREAM, '#c9a25a'];
      jars.forEach((jar, i) => {
        const jx = i < 3 ? X(-35 + i * 9) : X(14 + (i - 3) * 10);
        pen.rect(jx, Y(49), 5, 5, jar);
        pen.rect(jx, Y(50), 5, 1, shade(jar, -0.25));
      });
      // 기둥
      pen.rect(X(-46), Y(56), 4, 56, WOOD);
      pen.rect(X(42), Y(56), 4, 56, WOOD);
      pen.rect(X(-46), Y(56), 1, 56, WOOD_LIGHT);
      pen.rect(X(45), Y(56), 1, 56, WOOD_DARK);
      // 차양 — 줄무늬 천에 물결 모양 끝
      for (let i = 0; i < 10; i += 1) {
        const sx = X(-50 + i * 10);
        const fill = i % 2 === 0 ? color : stripe;
        pen.rect(sx, Y(68), 10, 12, fill);
        pen.rect(sx, Y(58), 10, 2, i % 2 === 0 ? dark : shade(stripe, -0.14));
        pen.rect(sx + 1, Y(56), 8, 2, fill);
        pen.rect(sx + 2, Y(54), 6, 1, fill);
      }
      pen.rect(X(-50), Y(69), 100, 1, shade(color, 0.25));
      // 간판
      pen.rect(X(-45), Y(85), 90, 15, WOOD_DARK);
      pen.rect(X(-44), Y(84), 88, 13, CREAM);
      pen.rect(X(-44), Y(72), 88, 1, shade(CREAM, -0.16));
      pen.rect(X(-44), Y(84), 88, 1, '#ffffff');
      const label = textSprite(name, INK);
      pen.blit(label, X(-Math.round(label.w / 2)), Y(84));
      // 지붕 위 그릇 받침
      pen.rect(X(-10), Y(87), 20, 2, WOOD_DARK);
    },
    INK,
  );

  const front = makeSprite(
    W,
    BOOTH.counterTop + 16,
    (pen) => {
      const top = 16;
      // 계산대 상판과 앞판
      pen.rect(X(-48), top, 96, 3, WOOD_LIGHT);
      pen.rect(X(-48), top, 96, 1, '#e8bd82');
      pen.rect(X(-46), top + 3, 92, BOOTH.counterTop - 3, WOOD);
      pen.rect(X(-46), top + 3, 92, 1, WOOD_DARK);
      // 앞판에 건 천 — 국수 이름
      const text = textSprite(dish, CREAM);
      const clothW = Math.max(40, text.w + 12);
      pen.rect(X(-Math.round(clothW / 2)), top + 5, clothW, 15, color);
      pen.rect(X(-Math.round(clothW / 2)), top + 19, clothW, 1, dark);
      pen.blit(text, X(-Math.round(text.w / 2)), top + 6);
      // 수저통
      pen.rect(X(-40), top - 6, 6, 6, '#8a5a7a');
      pen.rect(X(-39), top - 10, 1, 4, CREAM);
      pen.rect(X(-37), top - 9, 1, 3, CREAM);
      if (counterBowl) pen.blit(counterBowl, X(20), top - counterBowl.h + 3);
    },
    INK,
  );

  return { back, front };
}

/** 부스 차양 끝에 거는 초롱 */
export function makeLantern(color: string): Sprite {
  return makeSprite(
    7,
    11,
    (pen) => {
      pen.rect(3, 0, 1, 2, INK);
      pen.rect(2, 2, 3, 1, WOOD_DARK);
      pen.rect(1, 3, 5, 6, color);
      pen.rect(0, 4, 7, 4, color);
      pen.rect(2, 4, 1, 4, shade(color, 0.4));
      pen.rect(2, 9, 3, 1, WOOD_DARK);
      pen.px(3, 10, '#f2b632');
    },
    INK,
  );
}

/** 맛본 부스 지붕에 꽂는 깃발 */
export function makeTastedFlag(): Sprite {
  const text = textSprite('맛봄', '#ffffff');
  return makeSprite(
    text.w + 8,
    26,
    (pen) => {
      pen.rect(0, 0, 2, 26, WOOD_DARK);
      pen.rect(2, 1, text.w + 6, 14, '#2f3f7a');
      pen.rect(2, 14, text.w + 6, 1, '#1f2c57');
      pen.blit(text, 5, 1);
    },
    INK,
  );
}

/** 분류가 바뀌는 자리의 안내 팻말 */
export function makeSignpost(title: string, color: string): Sprite {
  const text = textSprite(title, CREAM);
  const w = text.w + 12;
  return makeSprite(
    w,
    50,
    (pen) => {
      const mid = Math.round(w / 2);
      pen.rect(mid - 2, 14, 4, 36, WOOD);
      pen.rect(mid - 2, 14, 1, 36, WOOD_LIGHT);
      pen.rect(0, 0, w, 17, shade(color, -0.3));
      pen.rect(1, 1, w - 2, 15, color);
      pen.rect(1, 1, w - 2, 1, shade(color, 0.3));
      pen.blit(text, 6, 2);
    },
    INK,
  );
}

/** 입구 문. 그림의 가운데가 문의 가운데다 */
export const GATE = { half: 66, height: 118 };

export function makeGate(title: string): Sprite {
  const W = GATE.half * 2;
  const H = GATE.height;
  return makeSprite(
    W,
    H,
    (pen) => {
      const red = '#2f3f7a';
      // 기둥
      for (const x of [6, W - 16]) {
        pen.rect(x, 20, 10, H - 20, red);
        pen.rect(x, 20, 2, H - 20, '#4a5ea0');
        pen.rect(x + 8, 20, 2, H - 20, '#1f2c57');
        pen.rect(x - 2, H - 6, 14, 6, '#5a4a66');
        pen.rect(x - 2, H - 6, 14, 1, '#7a6a86');
      }
      // 현판
      pen.rect(0, 2, W, 24, '#1f2c57');
      pen.rect(2, 4, W - 4, 20, red);
      pen.rect(2, 4, W - 4, 1, '#4a5ea0');
      pen.rect(0, 0, W, 3, WOOD_DARK);
      const text = textSprite(title, CREAM);
      pen.blit(text, Math.round((W - text.w) / 2), 8);
      // 현판 아래 삼각 깃발
      const flags = ['#f2b632', CREAM, '#6fb7a8', CREAM];
      for (let i = 0; i < 12; i += 1) {
        const fx = 18 + i * 8;
        const color = flags[i % flags.length];
        pen.rect(fx, 27, 7, 2, color);
        pen.rect(fx + 1, 29, 5, 2, color);
        pen.rect(fx + 2, 31, 3, 2, color);
        pen.px(fx + 3, 33, color);
      }
    },
    INK,
  );
}

/** 계산대 위의 금전 등록기 */
export function makeRegister(): Sprite {
  return makeSprite(
    16,
    14,
    (pen) => {
      pen.rect(2, 0, 9, 5, '#3a4a6b');
      pen.rect(3, 1, 7, 3, '#9fe0c8');
      pen.rect(0, 5, 16, 9, '#5a6a8f');
      pen.rect(0, 5, 16, 1, '#7f90b8');
      for (let i = 0; i < 4; i += 1) {
        pen.rect(2 + i * 3, 7, 2, 2, CREAM);
        pen.rect(2 + i * 3, 10, 2, 2, i === 3 ? '#2f3f7a' : CREAM);
      }
    },
    INK,
  );
}

/* ── 배경 ── */

/** 먼 건물 줄. 옆으로 이어 붙일 수 있다 */
export function makeSkyline(width: number, height: number, color: string, windows: string, seed: number): Sprite {
  const rand = seeded(seed);
  return makeSprite(width, height, (pen) => {
    let x = 0;
    while (x < width) {
      const w = 14 + Math.floor(rand() * 20);
      const h = Math.round(height * (0.35 + rand() * 0.65));
      const top = height - h;
      pen.rect(x, top, w, h, color);
      pen.rect(x, top, 1, h, shade(color, 0.12));
      if (rand() > 0.6) pen.rect(x + Math.floor(w / 2), top - 6, 1, 6, color);
      if (rand() > 0.7) pen.rect(x + 2, top - 3, w - 4, 3, color);
      for (let wy = top + 4; wy < height - 4; wy += 6) {
        for (let wx = x + 3; wx < x + w - 3; wx += 5) {
          if (rand() > 0.62) pen.rect(wx, wy, 2, 3, rand() > 0.3 ? windows : '#ee8a6b');
        }
      }
      x += w + (rand() > 0.75 ? 4 : 0);
    }
  });
}

/** 부스 뒤로 이어지는 나무와 천막 실루엣 */
export function makeTreeline(width: number, height: number, color: string, seed: number): Sprite {
  const rand = seeded(seed);
  return makeSprite(width, height, (pen) => {
    pen.rect(0, height - 8, width, 8, color);
    let x = 4;
    while (x < width - 10) {
      if (rand() > 0.35) {
        const r = 8 + Math.floor(rand() * 9);
        const cy = height - 10 - Math.floor(rand() * (height - 30));
        pen.ellipse(x + r, cy, r, Math.round(r * 0.85), color);
        pen.ellipse(x + r + Math.round(r * 0.7), cy + 5, Math.round(r * 0.7), Math.round(r * 0.6), color);
        pen.rect(x + r - 1, cy, 3, height - cy, color);
        x += r * 2 + 4;
      } else {
        // 뾰족한 천막
        const w = 26;
        for (let i = 0; i < w / 2; i += 1) pen.rect(x + i, height - 8 - i, w - i * 2, 1, color);
        pen.rect(x + w / 2, height - 8 - w / 2 - 5, 1, 5, color);
        pen.rect(x + w / 2 + 1, height - 8 - w / 2 - 5, 4, 2, '#2f3f7a');
        x += w + 6;
      }
    }
  });
}

/** 부스 사이 빈 곳을 채우는 낮은 울타리 */
export function makeHedge(): Sprite {
  const rand = seeded(11);
  return makeSprite(64, 16, (pen) => {
    pen.rect(0, 4, 64, 12, '#2c4a4a');
    for (let x = 0; x < 64; x += 8) {
      pen.ellipse(x + 4, 4, 4, 3, '#2c4a4a');
      pen.rect(x + 2, 2, 3, 1, '#4a7a68');
      if (rand() > 0.5) pen.px(x + 5, 6 + Math.floor(rand() * 5), '#f08aa0');
      pen.px(x + 1 + Math.floor(rand() * 6), 8 + Math.floor(rand() * 5), '#3d6658');
    }
    pen.rect(0, 14, 64, 2, '#1f3438');
  });
}

/** 화면 앞쪽을 지나가는 화분 */
export function makePlanter(seed: number): Sprite {
  const rand = seeded(seed);
  return makeSprite(
    26,
    30,
    (pen) => {
      pen.rect(3, 18, 20, 12, '#4a3350');
      pen.rect(3, 18, 20, 2, '#6a4f70');
      pen.rect(5, 28, 16, 2, '#33223a');
      for (let i = 0; i < 6; i += 1) {
        const cx = 4 + Math.floor(rand() * 18);
        const cy = 6 + Math.floor(rand() * 9);
        pen.ellipse(cx, cy, 4, 4, i % 2 === 0 ? '#27424a' : '#335a58');
      }
      for (let i = 0; i < 4; i += 1) pen.px(4 + Math.floor(rand() * 18), 5 + Math.floor(rand() * 10), '#f2b632');
    },
    '#1a1024',
  );
}

export function makeMoon(): Sprite {
  return makeSprite(23, 23, (pen) => {
    pen.ellipse(11, 11, 11, 11, '#fbeecb');
    pen.ellipse(13, 13, 8, 8, '#f3deaa');
    pen.ellipse(7, 7, 2, 2, '#ecd49a');
    pen.ellipse(14, 15, 3, 2, '#e6cb8c');
    pen.px(15, 6, '#ecd49a');
  });
}

/** 가까이 선 부스 위에서 까딱이는 화살표 */
export function makeArrow(): Sprite {
  return makeSprite(
    9,
    7,
    (pen) => {
      pen.rect(0, 0, 9, 2, '#f2b632');
      pen.rect(1, 2, 7, 1, '#f2b632');
      pen.rect(2, 3, 5, 1, '#f2b632');
      pen.rect(3, 4, 3, 1, '#f2b632');
      pen.px(4, 5, '#f2b632');
      pen.rect(0, 0, 9, 1, '#fbe08a');
    },
    INK,
  );
}

export const WOOD_COLORS = { base: WOOD, light: WOOD_LIGHT, dark: WOOD_DARK };

/** 그림의 한 부분을 잘라 새 그림으로 만든다 */
export function cropSprite(sprite: Sprite, x: number, y: number, w: number, h: number): Sprite {
  return makeSprite(w, h, (pen) => {
    pen.ctx.drawImage(sprite.img, x + sprite.pad, y + sprite.pad, w, h, 0, 0, w, h);
  });
}

/** 바닥에 이어 붙이는 돌바닥 한 장 */
export function makeFloorTile(): Sprite {
  return makeSprite(64, 64, (pen) => {
    for (let row = 0; row < 4; row += 1) {
      const y = row * 16;
      pen.rect(0, y, 64, 16, row % 2 === 0 ? '#625789' : '#5a4f80');
      pen.rect(0, y + 15, 64, 1, '#453c68');
      const offset = row % 2 === 0 ? 0 : 16;
      pen.rect(offset, y, 1, 15, '#453c68');
      pen.rect(offset + 32, y, 1, 15, '#453c68');
      pen.rect(offset + 1, y, 31, 1, '#72679c');
      pen.rect(offset + 33, y, 31, 1, '#6a5f93');
    }
  });
}

/** 기둥 사이에 늘어진 줄 전구 한 칸. lit이 다르면 켜진 전구가 달라진다 */
export function makeLightString(phase: number): Sprite {
  const bulbs = ['#f9c476', '#f2c66a', '#8fd3c8', '#f6eedb'];
  return makeSprite(112, 16, (pen) => {
    for (let i = 0; i <= 14; i += 1) {
      const t = i / 14;
      const x = Math.round(t * 111);
      const y = Math.round(Math.sin(t * Math.PI) * 9) + 1;
      pen.rect(x - 4, y, 8, 1, '#3a2a4a');
      if (i === 0 || i === 14) continue;
      const lit = (i + phase) % 4 !== 0;
      pen.rect(x - 1, y + 1, 3, 3, lit ? bulbs[i % 4] : '#6a5a7a');
      if (lit) pen.px(x, y + 2, '#ffffff');
    }
  });
}

/** 발밑 그림자 */
export function makeShadow(): Sprite {
  return makeSprite(18, 7, (pen) => {
    pen.ellipse(9, 3, 8, 3, '#1a0e24');
  });
}

/* ── 위에서 내려다보는 장면에 쓰는 것 ── */

/** 잔디 바닥 한 장 */
export function makeGrassTile(): Sprite {
  const rand = seeded(5);
  return makeSprite(64, 64, (pen) => {
    pen.rect(0, 0, 64, 64, '#2f5a55');
    for (let i = 0; i < 70; i += 1) {
      const x = Math.floor(rand() * 64);
      const y = Math.floor(rand() * 64);
      pen.rect(x, y, 1, 2, rand() > 0.5 ? '#3d7264' : '#284c4c');
    }
    for (let i = 0; i < 5; i += 1) pen.px(Math.floor(rand() * 64), Math.floor(rand() * 64), rand() > 0.5 ? '#f2b632' : '#f08aa0');
  });
}

/** 부스 뒤에 서는 나무 */
export function makeTree(seed: number): Sprite {
  const rand = seeded(seed);
  const leaf = ['#2f6b5c', '#3d8068', '#27544f'];
  return makeSprite(
    40,
    58,
    (pen) => {
      pen.rect(18, 34, 5, 24, '#6a4630');
      pen.rect(18, 34, 2, 24, '#8a5c3c');
      pen.ellipse(20, 22, 17, 15, leaf[2]);
      pen.ellipse(15, 18, 12, 11, leaf[0]);
      pen.ellipse(26, 15, 10, 9, leaf[0]);
      pen.ellipse(13, 13, 7, 6, leaf[1]);
      pen.ellipse(27, 10, 5, 4, leaf[1]);
      for (let i = 0; i < 6; i += 1) pen.px(6 + Math.floor(rand() * 28), 8 + Math.floor(rand() * 24), '#f9c476');
    },
    INK,
  );
}

/** 길가에 놓는 긴 의자 */
export function makeBench(): Sprite {
  return makeSprite(
    30,
    14,
    (pen) => {
      pen.rect(0, 0, 30, 4, WOOD_LIGHT);
      pen.rect(0, 4, 30, 2, WOOD);
      pen.rect(2, 6, 3, 8, WOOD_DARK);
      pen.rect(25, 6, 3, 8, WOOD_DARK);
    },
    INK,
  );
}
