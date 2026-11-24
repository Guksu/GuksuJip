/** 국숫집의 그림. 가게 앞, 가게 안, 주인장, 손님을 칸 단위로 그린다. */
import { INK, Pen, makeSprite, seeded, shade, textSprite, type Sprite } from './paint';

export const INDIGO = '#2f3f7a';
const INDIGO_DARK = '#1f2c57';
const CREAM = '#f6eedb';
const PLASTER = '#ead9b5';
const WOOD = '#a86a3c';
const WOOD_LIGHT = '#d9a566';
const WOOD_DARK = '#5a3a2c';
const LAMP = '#f2c66a';
const SKIN = '#dba27c';

/* ── 주인장 ── */

export const CHEF = { w: 36, h: 46 };
export type ChefPose = 'idle' | 'blink' | 'talk' | 'present';

/** 카운터 뒤에 선 주인장. 정면을 보고 윗몸만 그린다 */
export function makeChef(pose: ChefPose): Sprite {
  return makeSprite(
    CHEF.w,
    CHEF.h,
    (pen) => {
      const hair = '#1c1917';
      // 팔 — 그릇을 낼 때는 앞으로 모은다
      if (pose === 'present') {
        pen.rect(3, 31, 5, 13, '#d8d2c4');
        pen.rect(28, 31, 5, 13, '#d8d2c4');
        pen.rect(6, 42, 6, 4, SKIN);
        pen.rect(24, 42, 6, 4, SKIN);
      } else {
        pen.rect(0, 30, 4, 16, '#d8d2c4');
        pen.rect(32, 30, 4, 16, '#d8d2c4');
      }
      // 몸 — 흰 옷에 남색 앞치마
      pen.rect(3, 28, 30, 18, '#f1ede3');
      pen.rect(3, 28, 30, 1, '#ffffff');
      pen.rect(12, 28, 2, 9, '#d8d2c4');
      pen.rect(22, 28, 2, 9, '#d8d2c4');
      pen.rect(14, 28, 8, 4, SKIN);
      pen.rect(15, 32, 6, 1, SKIN);
      pen.rect(8, 35, 20, 2, INDIGO_DARK);
      pen.rect(8, 37, 20, 9, INDIGO);
      pen.rect(16, 39, 4, 4, CREAM);
      // 머리
      pen.rect(15, 25, 6, 3, shade(SKIN, -0.12));
      pen.rect(8, 9, 20, 15, SKIN);
      pen.rect(10, 24, 16, 2, SKIN);
      pen.rect(6, 14, 2, 5, SKIN);
      pen.rect(28, 14, 2, 5, SKIN);
      pen.rect(9, 0, 18, 3, hair);
      pen.rect(7, 2, 22, 5, hair);
      pen.rect(7, 7, 1, 6, hair);
      pen.rect(28, 7, 1, 6, hair);
      // 머리띠
      pen.rect(6, 5, 24, 5, CREAM);
      pen.rect(6, 9, 24, 1, '#d8d2c4');
      pen.rect(24, 6, 3, 3, INDIGO);
      // 얼굴
      pen.rect(11, 12, 5, 1, hair);
      pen.rect(20, 12, 5, 1, hair);
      if (pose === 'blink') {
        pen.rect(11, 16, 4, 1, hair);
        pen.rect(21, 16, 4, 1, hair);
      } else {
        pen.rect(12, 14, 2, 3, hair);
        pen.rect(22, 14, 2, 3, hair);
        pen.px(12, 14, '#5a4a66');
        pen.px(22, 14, '#5a4a66');
      }
      pen.rect(9, 18, 3, 2, '#e9ae96');
      pen.rect(24, 18, 3, 2, '#e9ae96');
      if (pose === 'talk') pen.rect(15, 20, 6, 3, '#6e2f22');
      else {
        pen.rect(15, 21, 6, 1, '#6e2f22');
        pen.px(14, 20, '#6e2f22');
        pen.px(21, 20, '#6e2f22');
      }
    },
    INK,
  );
}

/** 카운터에 앉은 손님의 뒷모습 */
export function makeGuest(hair: string, top: string): Sprite {
  return makeSprite(
    18,
    24,
    (pen) => {
      pen.rect(4, 0, 10, 2, hair);
      pen.rect(3, 2, 12, 8, hair);
      pen.rect(7, 10, 4, 2, SKIN);
      pen.rect(1, 12, 16, 12, top);
      pen.rect(1, 12, 16, 1, shade(top, 0.2));
      pen.rect(0, 14, 2, 9, shade(top, -0.15));
      pen.rect(16, 14, 2, 9, shade(top, -0.15));
    },
    INK,
  );
}

export function makeStool(): Sprite {
  return makeSprite(
    16,
    14,
    (pen) => {
      pen.rect(0, 0, 16, 4, WOOD_LIGHT);
      pen.rect(0, 3, 16, 1, WOOD);
      pen.rect(2, 4, 2, 10, WOOD_DARK);
      pen.rect(12, 4, 2, 10, WOOD_DARK);
      pen.rect(3, 9, 10, 1, WOOD_DARK);
    },
    INK,
  );
}

/** 천장에서 내려온 종이 등 */
export function makeLamp(): Sprite {
  return makeSprite(
    15,
    26,
    (pen) => {
      pen.rect(7, 0, 1, 12, INK);
      pen.rect(5, 12, 5, 2, WOOD_DARK);
      pen.rect(2, 14, 11, 9, LAMP);
      pen.rect(0, 16, 15, 5, LAMP);
      pen.rect(4, 15, 2, 7, '#fbe3a6');
      pen.rect(5, 23, 5, 1, WOOD_DARK);
      pen.rect(7, 24, 1, 2, '#c99a3a');
    },
    INK,
  );
}

/** 불 위에 올린 솥 */
export function makePot(): Sprite {
  return makeSprite(
    34,
    22,
    (pen) => {
      pen.rect(2, 4, 30, 16, '#8f959c');
      pen.rect(2, 4, 30, 2, '#c3c8cd');
      pen.rect(24, 6, 8, 14, '#6f757c');
      pen.rect(0, 2, 34, 3, '#a9afb5');
      pen.rect(0, 8, 2, 4, '#55585d');
      pen.rect(32, 8, 2, 4, '#55585d');
      pen.rect(4, 0, 26, 2, '#e8dfc8');
      pen.rect(0, 20, 34, 2, '#2a2622');
    },
    INK,
  );
}

/* ── 가게 안 ── */

export const INSIDE = {
  /** 그림의 폭. 화면보다 넓게 그려 두고 가운데를 맞춘다 */
  width: 720,
  /** 바닥에서 카운터 상판까지의 높이 */
  counter: 46,
  /** 화면 아래에서 바닥선까지 */
  floor: 16,
};

/** 카운터 뒤쪽 — 벽, 선반, 솥 자리. 높이 h의 그림이고 아래 끝이 바닥선이다 */
export function makeInsideBack(h: number): Sprite {
  const W = INSIDE.width;
  const cx = W / 2;
  const rand = seeded(17);
  return makeSprite(W, h, (pen) => {
    pen.rect(0, 0, W, h, PLASTER);
    // 벽의 얼룩과 아래쪽 널벽
    for (let i = 0; i < 90; i += 1) pen.px(Math.floor(rand() * W), Math.floor(rand() * h), shade(PLASTER, -0.05));
    const wainscot = h - 70;
    for (let x = 0; x < W; x += 14) {
      pen.rect(x, wainscot, 14, 70, x % 28 === 0 ? '#b98a5a' : '#b08152');
      pen.rect(x + 13, wainscot, 1, 70, '#8f643c');
    }
    pen.rect(0, wainscot - 3, W, 3, WOOD_DARK);
    // 천장 들보
    pen.rect(0, 0, W, 9, WOOD_DARK);
    pen.rect(0, 9, W, 2, '#3f2a20');
    // 낮은 선반 한 줄 — 위쪽은 차림 쪽지 자리라 비우고, 주인장이 설 가운데도 비운다
    const shelfY = h - 88;
    for (const [x0, x1] of [
      [cx - 200, cx - 38],
      [cx + 38, cx + 200],
    ]) {
      pen.rect(x0, shelfY, x1 - x0, 3, WOOD);
      pen.rect(x0, shelfY + 3, x1 - x0, 1, WOOD_DARK);
      for (const bx of [x0 + 20, x1 - 22]) pen.rect(bx, shelfY + 4, 2, 6, WOOD_DARK);
      for (let x = x0 + 6; x < x1 - 16; x += 16 + Math.floor(rand() * 8)) {
        const kind = rand();
        if (kind < 0.5) {
          // 엎어 둔 그릇
          pen.rect(x, shelfY - 7, 12, 7, CREAM);
          pen.rect(x, shelfY - 4, 12, 1, INDIGO);
          pen.rect(x + 9, shelfY - 7, 3, 7, '#d8cdb8');
          pen.rect(x - 1, shelfY - 1, 14, 1, '#d8cdb8');
        } else if (kind < 0.75) {
          // 병
          const color = rand() > 0.5 ? '#4f7a4a' : '#c99a3a';
          pen.rect(x + 2, shelfY - 13, 6, 13, color);
          pen.rect(x + 4, shelfY - 16, 2, 3, color);
          pen.rect(x + 2, shelfY - 9, 6, 4, CREAM);
          pen.rect(x + 6, shelfY - 13, 2, 13, shade(color, -0.2));
        } else {
          // 단지
          pen.rect(x, shelfY - 9, 10, 9, '#6b4a3a');
          pen.rect(x + 1, shelfY - 11, 8, 2, '#8a6450');
          pen.rect(x + 7, shelfY - 9, 3, 9, '#553828');
        }
      }
    }
    // 뒤쪽 조리대
    pen.rect(0, h - 58, W, 4, '#c3c8cd');
    pen.rect(0, h - 54, W, 54, '#8f959c');
    pen.rect(0, h - 54, W, 1, '#6f757c');
    // 도마와 칼
    pen.rect(cx - 96, h - 62, 30, 4, WOOD_LIGHT);
    pen.rect(cx - 90, h - 65, 14, 3, '#e8dfc8');
    pen.rect(cx - 70, h - 64, 10, 2, '#c3c8cd');
    pen.rect(cx - 60, h - 64, 5, 2, WOOD_DARK);
  });
}

/** 카운터와 그 앞 — 상판, 앞판, 바닥 */
export function makeInsideFront(): Sprite {
  const W = INSIDE.width;
  const H = INSIDE.counter + INSIDE.floor;
  return makeSprite(W, H, (pen) => {
    // 상판
    pen.rect(0, 0, W, 6, WOOD_LIGHT);
    pen.rect(0, 0, W, 1, '#ecc48a');
    pen.rect(0, 5, W, 1, '#b98448');
    // 앞판 널
    for (let x = 0; x < W; x += 18) {
      pen.rect(x, 6, 18, INSIDE.counter - 6, (x / 18) % 2 === 0 ? WOOD : '#9c6136');
      pen.rect(x + 17, 6, 1, INSIDE.counter - 6, '#7a4a2c');
    }
    pen.rect(0, 6, W, 2, '#7a4a2c');
    pen.rect(0, INSIDE.counter - 5, W, 5, WOOD_DARK);
    // 바닥
    pen.rect(0, INSIDE.counter, W, INSIDE.floor, '#4a3226');
    pen.rect(0, INSIDE.counter, W, 1, '#2f2018');
    for (let x = 0; x < W; x += 40) pen.rect(x, INSIDE.counter + 1, 1, INSIDE.floor - 1, '#3a271e');
  });
}

/* ── 가게 앞 ── */

export const FRONT = { width: 300, height: 150, door: 22 };

/** 밤의 가게 앞. 그림의 아래 끝이 땅이고 가운데가 문이다 */
export function makeFront(): Sprite {
  const { width: W, height: H } = FRONT;
  const cx = W / 2;
  return makeSprite(
    W,
    H,
    (pen) => {
      const wallTop = 52;
      // 지붕 — 기와 줄
      for (let row = 0; row < 5; row += 1) {
        const inset = (4 - row) * 5;
        pen.rect(inset, 22 + row * 6, W - inset * 2, 6, row % 2 === 0 ? '#2b3350' : '#343d5e');
        for (let x = inset + (row % 2) * 4; x < W - inset; x += 8) pen.rect(x, 22 + row * 6, 1, 6, '#1f2640');
      }
      pen.rect(0, wallTop - 2, W, 4, '#1c2138');
      // 지붕에 쌓인 눈
      pen.rect(20, 20, W - 40, 3, '#e8eef6');
      pen.rect(34, 18, W - 110, 2, '#e8eef6');
      // 벽
      pen.rect(12, wallTop + 2, W - 24, H - wallTop - 2, PLASTER);
      pen.rect(12, H - 34, W - 24, 34, '#9c6136');
      for (let x = 12; x < W - 12; x += 12) pen.rect(x, H - 34, 1, 34, '#7a4a2c');
      pen.rect(12, H - 36, W - 24, 2, WOOD_DARK);
      for (const x of [12, cx - 34, cx + 30, W - 16]) pen.rect(x, wallTop + 2, 4, H - wallTop - 2, WOOD_DARK);
      // 격자창 — 안의 불빛이 비친다
      for (const x0 of [30, cx + 46]) {
        pen.rect(x0, 72, 72, 38, LAMP);
        pen.rect(x0, 72, 72, 10, '#fbe3a6');
        for (let x = x0; x <= x0 + 72; x += 12) pen.rect(x, 72, 2, 38, WOOD_DARK);
        pen.rect(x0, 72, 74, 2, WOOD_DARK);
        pen.rect(x0, 90, 74, 2, WOOD_DARK);
        pen.rect(x0, 108, 74, 2, WOOD_DARK);
      }
      // 문 — 안쪽이 들여다보인다
      const door = FRONT.door;
      pen.rect(cx - door, 74, door * 2, H - 74, '#3a271e');
      pen.rect(cx - door, 100, door * 2, 14, LAMP);
      pen.rect(cx - door, 114, door * 2, 4, WOOD_LIGHT);
      pen.rect(cx - door, 118, door * 2, H - 118, '#6b452c');
      pen.rect(cx - door - 2, 72, door * 2 + 4, 3, WOOD_DARK);
      // 노렌
      const letters = ['국', '수', '집'];
      for (let i = 0; i < 3; i += 1) {
        const x = cx - door + 1 + i * 14;
        pen.rect(x, 75, 13, 26, INDIGO);
        pen.rect(x, 75, 13, 1, '#4a5ea0');
        pen.rect(x + 12, 75, 1, 26, INDIGO_DARK);
        const text = textSprite(letters[i], CREAM);
        pen.blit(text, x + 1, 80);
      }
      pen.rect(cx - door - 3, 73, door * 2 + 6, 2, WOOD_LIGHT);
      // 현판
      const sign = textSprite('Product Developer', INK);
      const signHalf = Math.round(sign.w / 2) + 6;
      pen.rect(cx - signHalf - 2, 52, signHalf * 2 + 4, 18, WOOD_DARK);
      pen.rect(cx - signHalf, 54, signHalf * 2, 14, CREAM);
      pen.blit(sign, cx - Math.round(sign.w / 2), 54);
      // 차림 알림판과 대나무 화분
      pen.rect(cx - 62, H - 40, 22, 40, '#2a2622');
      pen.rect(cx - 60, H - 38, 18, 26, '#1d1a18');
      for (let i = 0; i < 4; i += 1) pen.rect(cx - 58, H - 34 + i * 6, 10 + (i % 2) * 4, 2, CREAM);
      pen.rect(cx - 96, H - 16, 18, 16, '#6b452c');
      for (const x of [cx - 92, cx - 87, cx - 82]) {
        pen.rect(x, H - 62, 2, 46, '#5f9a4a');
        pen.rect(x - 3, H - 50 + (x % 3) * 6, 4, 2, '#7fb86a');
      }
      // 긴 의자
      pen.rect(cx + 52, H - 20, 46, 4, WOOD_LIGHT);
      pen.rect(cx + 56, H - 16, 3, 16, WOOD_DARK);
      pen.rect(cx + 91, H - 16, 3, 16, WOOD_DARK);
    },
    INK,
  );
}

/** 문 옆에 거는 종이 초롱 */
export function makePaperLantern(letters: string): Sprite {
  return makeSprite(
    15,
    32,
    (pen) => {
      pen.rect(7, 0, 1, 4, INK);
      pen.rect(4, 4, 7, 2, WOOD_DARK);
      pen.rect(1, 6, 13, 22, LAMP);
      pen.rect(0, 9, 15, 16, LAMP);
      pen.rect(3, 7, 2, 20, '#fbe3a6');
      pen.rect(4, 28, 7, 2, WOOD_DARK);
      [...letters].forEach((letter, i) => {
        const text = textSprite(letter, INK);
        pen.blit(text, 2, 6 + i * 11);
      });
    },
    INK,
  );
}

/** 요리 장면에 쓰는 큰 솥. 위에서 조금 내려다본 모습 */
export function paintBigPot(pen: Pen, cx: number, cy: number, r: number): void {
  pen.ellipse(cx, cy + 6, r + 4, Math.round(r * 0.5) + 4, '#55585d');
  pen.rect(cx - r - 4, cy + 6, (r + 4) * 2 + 1, 40, '#8f959c');
  pen.rect(cx + Math.round(r * 0.4), cy + 6, r + 4 - Math.round(r * 0.4), 40, '#6f757c');
  pen.ellipse(cx, cy, r + 4, Math.round(r * 0.5) + 3, '#c3c8cd');
  pen.ellipse(cx, cy, r, Math.round(r * 0.5), '#e9e2cc');
}

/** 벽에 붙인 차림 쪽지. 국수 이름을 세로로 쓴 종이를 분류별로 묶어 나무 막대에 건다.
 *  쪽지 사이는 넉넉히 띄우고, 분류가 바뀌는 자리는 더 띄워서 멀리서도 한 장씩 읽힌다 */
export const STRIP = { w: 15, gap: 8, groupGap: 20, rail: 5 };

export interface MenuStrips {
  sprite: Sprite;
  /** 쪽지마다 '맛봄' 표시를 찍을 자리(그림 안에서의 x, y). 묶음을 이어 붙인 순서다 */
  marks: { x: number; y: number }[];
  /** 묶음 사이 빈자리의 가운데 x. 등을 이 자리에 달면 쪽지를 가리지 않는다 */
  gaps: number[];
}

export function makeMenuStrips(groups: readonly (readonly string[])[]): MenuStrips {
  const lettersOf = (dish: string) => [...dish.replace(/\s/g, '')];
  const longest = Math.max(...groups.flat().map((dish) => lettersOf(dish).length));
  const paper = longest * 12 + 16;
  const marks: { x: number; y: number }[] = [];
  const spans: { x: number; w: number }[] = [];
  const slots: { x: number; dish: string }[] = [];
  const gaps: number[] = [];
  let x = 0;
  groups.forEach((group, g) => {
    if (g > 0) {
      gaps.push(x - STRIP.gap + STRIP.groupGap / 2 + 3);
      x += STRIP.groupGap - STRIP.gap;
    }
    const start = x;
    group.forEach((dish) => {
      slots.push({ x, dish });
      x += STRIP.w + STRIP.gap;
    });
    spans.push({ x: start - 3, w: x - STRIP.gap - start + 6 });
  });
  const width = x - STRIP.gap;
  const sprite = makeSprite(
    width + 6,
    STRIP.rail + paper,
    (pen) => {
      // 묶음마다 쪽지를 거는 나무 막대
      for (const span of spans) {
        pen.rect(span.x + 3, 0, span.w, STRIP.rail, WOOD);
        pen.rect(span.x + 3, 0, span.w, 1, WOOD_LIGHT);
        pen.rect(span.x + 3, STRIP.rail - 1, span.w, 1, WOOD_DARK);
      }
      // 쪽지는 길이를 맞춰서 아래 끝이 한 줄로 떨어지게 한다
      for (const slot of slots) {
        const left = slot.x + 3;
        pen.rect(left, STRIP.rail - 1, STRIP.w, paper, CREAM);
        pen.rect(left + STRIP.w - 2, STRIP.rail + 1, 2, paper - 2, '#e0d3b4');
        pen.rect(left, STRIP.rail + paper - 3, STRIP.w, 2, '#e0d3b4');
        lettersOf(slot.dish).forEach((letter, row) => {
          const text = textSprite(letter, INK);
          pen.blit(text, left + 1, STRIP.rail + 2 + row * 12);
        });
        marks.push({ x: left + 4, y: STRIP.rail + paper - 12 });
      }
    },
    INK,
  );
  return { sprite, marks, gaps };
}

/** 카운터 위에 놓는 수저통 */
export function makeChopstickBox(): Sprite {
  return makeSprite(
    12,
    13,
    (pen) => {
      pen.rect(0, 5, 12, 8, WOOD_DARK);
      pen.rect(0, 5, 12, 1, WOOD);
      for (const x of [2, 5, 8]) pen.rect(x, 0, 1, 5, CREAM);
      pen.rect(3, 1, 1, 4, '#e0d3b4');
    },
    INK,
  );
}

/** 카운터 위에 놓는 물주전자와 컵 */
export function makeKettle(): Sprite {
  return makeSprite(
    22,
    14,
    (pen) => {
      pen.rect(0, 3, 12, 11, '#c9a25a');
      pen.rect(0, 3, 12, 2, '#e2c078');
      pen.rect(9, 5, 3, 9, '#a8843c');
      pen.rect(12, 5, 3, 2, '#c9a25a');
      pen.rect(3, 0, 6, 3, '#a8843c');
      pen.rect(15, 8, 6, 6, CREAM);
      pen.rect(15, 10, 6, 1, INDIGO);
      pen.rect(19, 8, 2, 6, '#e0d3b4');
    },
    INK,
  );
}

/** 손님 앞에 놓인 작은 그릇 */
export function makeSideBowl(): Sprite {
  return makeSprite(
    13,
    8,
    (pen) => {
      pen.rect(0, 0, 13, 2, '#fbf6ea');
      pen.rect(2, 0, 9, 1, '#e6d6ad');
      pen.rect(1, 2, 11, 3, '#fbf6ea');
      pen.rect(1, 3, 11, 1, INDIGO);
      pen.rect(3, 5, 7, 2, '#d8cdb8');
      pen.rect(9, 2, 3, 3, '#d8cdb8');
    },
    INK,
  );
}
