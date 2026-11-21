import * as THREE from 'three';
import type { BowlSpec, Topping } from '../data/menu';
import { GLOW, Vox, jitter, textPlane, textTexture } from './vox';

const WOOD = '#6b4a2f';
const WOOD_DARK = '#4a3120';
const WOOD_LIGHT = '#a97c4f';
const PLASTER = '#d9cbb0';
const TILE = '#2b3038';
const INDIGO = '#27376b';

/** 가게 크기. 앞벽이 z=0, 안쪽으로 -z */
export const SHOP = { halfW: 5, depth: 10, wallH: 4.2, doorHalfW: 1.3, doorH: 3 };

// ── 가게 밖 ─────────────────────────────────────────────
export function buildExterior(): THREE.Group {
  const g = new THREE.Group();
  const v = new Vox();
  const { halfW, wallH, doorHalfW, doorH } = SHOP;

  // 길
  v.b(-30, 30, -0.4, 0, 0, 16, '#33363d');
  for (let i = 0; i < 6; i++) {
    // 문 앞 디딤돌
    v.b(-1.1 + (i % 2) * 0.25, 0.9 + (i % 2) * 0.25, 0, 0.06, 0.6 + i * 1.5, 1.7 + i * 1.5, jitter('#6d6a66', i, 0.05));
  }
  v.b(-30, 30, -0.4, 0.1, 0, 0.5, '#4b4743'); // 가게 앞 턱

  // 앞벽 — 문 자리만 비운다
  v.b(-halfW, -doorHalfW, 0, 1.1, -0.3, 0, WOOD_DARK); // 왼쪽 아래 판벽
  v.b(doorHalfW, halfW, 0, 1.1, -0.3, 0, WOOD_DARK);
  v.planksX(-halfW, -doorHalfW, 0.05, 1.05, 0, 0.06, 0.4, WOOD, 3);
  v.planksX(doorHalfW, halfW, 0.05, 1.05, 0, 0.06, 0.4, WOOD, 9);
  v.b(-halfW, -doorHalfW, 1.1, wallH, -0.3, 0, PLASTER);
  v.b(doorHalfW, halfW, 1.1, wallH, -0.3, 0, PLASTER);
  v.b(-doorHalfW, doorHalfW, doorH, wallH, -0.3, 0, PLASTER);
  // 기둥과 문틀
  for (const x of [-halfW, -doorHalfW - 0.2, doorHalfW, halfW - 0.2]) v.b(x, x + 0.2, 0, wallH, -0.32, 0.08, WOOD_DARK);
  v.b(-doorHalfW - 0.2, doorHalfW + 0.2, doorH, doorH + 0.2, -0.32, 0.1, WOOD_DARK);
  v.b(-halfW, halfW, 1.05, 1.2, -0.32, 0.08, WOOD_DARK);
  // 노렌을 거는 대나무 봉
  v.b(-doorHalfW - 0.1, doorHalfW + 0.1, doorH - 0.12, doorH - 0.04, 0.1, 0.18, '#c9a25a');

  // 창살(창호지는 따로 빛나게)
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -4.3 : 2.1;
    v.b(x0 - 0.1, x0 + 2.3, 1.5, 1.6, -0.05, 0.08, WOOD_DARK);
    v.b(x0 - 0.1, x0 + 2.3, 3.0, 3.1, -0.05, 0.08, WOOD_DARK);
    for (let i = 0; i <= 5; i++) v.b(x0 + i * 0.44 - 0.04, x0 + i * 0.44 + 0.04, 1.5, 3.1, -0.05, 0.08, WOOD_DARK);
    v.b(x0 - 0.1, x0 + 2.3, 2.26, 2.34, -0.05, 0.07, WOOD_DARK);
  }

  // 지붕 — 앞으로 내민 처마를 계단처럼 쌓는다
  for (let i = 0; i < 4; i++) {
    const y = wallH + i * 0.32;
    v.b(-halfW - 0.9 + i * 0.1, halfW + 0.9 - i * 0.1, y, y + 0.34, -10.4, 1.5 - i * 0.75, jitter(TILE, i, 0.03));
  }
  for (let x = -halfW - 0.7; x < halfW + 0.7; x += 0.6) v.b(x, x + 0.3, wallH + 0.34, wallH + 0.42, 0.75, 1.5, '#3b414b'); // 기왓골
  v.b(-halfW - 0.9, halfW + 0.9, wallH - 0.12, wallH, -0.2, 1.45, WOOD_DARK); // 처마 밑

  // 간판
  v.b(-1.9, 1.9, 3.28, 4.12, 0.08, 0.22, WOOD_DARK);
  v.b(-1.8, 1.8, 3.36, 4.04, 0.2, 0.26, '#e9dcc0');

  // 긴 의자와 화분
  v.b(2.3, 4.5, 0.55, 0.67, 0.7, 1.4, WOOD_LIGHT);
  v.b(2.4, 2.55, 0, 0.55, 0.8, 1.3, WOOD).b(4.25, 4.4, 0, 0.55, 0.8, 1.3, WOOD);
  v.b(-4.6, -3.8, 0, 0.6, 0.7, 1.5, '#7a4a32');
  v.b(-4.5, -3.9, 0.6, 0.66, 0.8, 1.4, '#3a2a1c');
  for (let i = 0; i < 5; i++) {
    const x = -4.42 + i * 0.12;
    v.b(x, x + 0.08, 0.66, 1.9 + (i % 3) * 0.45, 0.95 + (i % 2) * 0.22, 1.03 + (i % 2) * 0.22, i % 2 ? '#3f7a45' : '#56975a');
    v.b(x - 0.14, x + 0.2, 1.5 + (i % 3) * 0.4, 1.58 + (i % 3) * 0.4, 0.9 + (i % 2) * 0.22, 1.1 + (i % 2) * 0.22, '#69a965');
  }
  // 세워 둔 차림 안내판
  v.b(-3.3, -2.3, 0, 1.5, 1.1, 1.18, WOOD_DARK).b(-3.22, -2.38, 0.5, 1.42, 1.18, 1.21, '#22262b');
  for (let i = 0; i < 4; i++) v.b(-3.1, -2.6 + (i % 2) * 0.1, 1.24 - i * 0.18, 1.29 - i * 0.18, 1.21, 1.23, '#e7e0d0');

  // 옆 건물 그림자와 전봇대
  v.b(-14, -6.2, 0, 6.5, -8, -0.6, '#1d2230').b(6.2, 15, 0, 5.2, -8, -0.8, '#1b202d');
  v.b(-12.5, -11.3, 3.6, 4.6, -0.62, -0.58, '#3b4660').b(8, 9, 2.4, 3.4, -0.82, -0.78, '#3b4660');
  v.b(7.0, 7.25, 0, 7.5, 0.9, 1.15, '#2a2622').b(6.4, 7.85, 6.6, 6.75, 0.95, 1.1, '#2a2622');
  g.add(v.mesh());

  // 빛나는 것 — 창호지, 초롱
  const glow = new Vox();
  glow.b(-4.3, -2.1, 1.6, 3.0, -0.12, -0.08, '#f4d79a').b(2.1, 4.3, 1.6, 3.0, -0.12, -0.08, '#f4d79a');
  g.add(glow.mesh(GLOW));

  const sign = textPlane(textTexture('국수집', 72, 16, { fg: '#2a1a10', size: 12, font: 'Galmuri11' }), 3.4, 0.76);
  sign.position.set(0, 3.7, 0.27);
  g.add(sign);

  g.add(buildLantern(-2.0, 3.35, 0.9, '국수'), buildLantern(2.0, 3.35, 0.9, '한상'));

  // 별
  const stars = new Vox();
  for (let i = 0; i < 60; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 12543.123) % 1;
    stars.c(x * 40, 8 + Math.abs(y) * 14, -24, 0.14, 0.14, 0.02, i % 7 === 0 ? '#ffe9b0' : '#9fb0d8');
  }
  stars.b(10, 12, 16, 18, -24, -23.9, '#f6e7b4').b(10.5, 12.4, 16.6, 18.4, -23.9, -23.8, '#0c1020'); // 초승달
  g.add(stars.mesh(GLOW));
  return g;
}

function buildLantern(x: number, y: number, z: number, text: string): THREE.Group {
  const g = new THREE.Group();
  const frame = new Vox();
  frame.c(0, 0.12, 0, 0.04, 0.5, 0.04, '#1d1a18').c(0, -0.14, 0, 0.36, 0.08, 0.36, '#1d1a18').c(0, -1.0, 0, 0.36, 0.08, 0.36, '#1d1a18');
  g.add(frame.mesh());
  const body = new Vox();
  body.c(0, -0.57, 0, 0.56, 0.78, 0.56, '#d8452c').c(0, -0.57, 0, 0.62, 0.5, 0.62, '#e2573a');
  g.add(body.mesh(GLOW));
  const label = textPlane(textTexture(text, 12, 26, { fg: '#fff3dc', size: 11, vertical: true }), 0.34, 0.72);
  label.position.set(0, -0.57, 0.32);
  g.add(label);
  g.position.set(x, y, z);
  return g;
}

/** 문에 거는 천. 조각마다 위쪽을 축으로 흔들리게 묶어서 돌려준다 */
export function buildNoren(): THREE.Group[] {
  const strips: THREE.Group[] = [];
  const marks = ['국', '수', '집', '〇'];
  const width = (SHOP.doorHalfW * 2) / 4;
  marks.forEach((mark, i) => {
    const pivot = new THREE.Group();
    const cloth = new Vox();
    cloth.b(-width / 2 + 0.02, width / 2 - 0.02, -1.25, 0, -0.02, 0.02, INDIGO);
    cloth.b(-width / 2 + 0.02, width / 2 - 0.02, -1.25, -1.19, -0.025, 0.025, '#1f2c57');
    pivot.add(cloth.mesh());
    const label = textPlane(textTexture(mark, 14, 14, { fg: '#f3ead6', size: 12 }), 0.5, 0.5, true);
    label.position.set(0, -0.6, 0.03);
    pivot.add(label);
    pivot.position.set(-SHOP.doorHalfW + width * (i + 0.5), SHOP.doorH - 0.08, 0.14);
    strips.push(pivot);
  });
  return strips;
}

// ── 가게 안 ─────────────────────────────────────────────
export const COUNTER = { top: 1.3, front: -4.2, back: -5.2 };

export function buildInterior(): THREE.Group {
  const g = new THREE.Group();
  const v = new Vox();
  const { halfW, depth, wallH } = SHOP;

  v.planksX(-halfW, halfW, -0.2, 0, -depth, 0, 0.5, '#5a3f2a', 20); // 바닥
  v.b(-halfW, halfW, 0, wallH, -depth - 0.3, -depth, '#cdbd9d'); // 뒷벽
  v.planksX(-halfW, halfW, 0, 1.2, -depth, -depth + 0.06, 0.45, WOOD, 40);
  v.b(-halfW - 0.3, -halfW, 0, wallH, -depth, 0, '#c4b393').b(halfW, halfW + 0.3, 0, wallH, -depth, 0, '#c4b393');
  v.planksZ(-halfW, -halfW + 0.06, 0, 1.2, -depth, 0, 0.45, WOOD, 60).planksZ(halfW - 0.06, halfW, 0, 1.2, -depth, 0, 0.45, WOOD, 80);
  v.b(-halfW, halfW, wallH, wallH + 0.3, -depth, 0, '#3a2a1e'); // 천장
  for (let z = -1.5; z > -depth; z -= 2.2) v.b(-halfW, halfW, wallH - 0.25, wallH, z - 0.15, z + 0.15, WOOD_DARK); // 들보

  // 카운터
  v.planksX(-4.2, 4.2, 0, COUNTER.top - 0.12, COUNTER.front - 0.08, COUNTER.front, 0.42, WOOD, 100);
  v.b(-4.2, 4.2, 0, COUNTER.top - 0.12, COUNTER.back, COUNTER.front - 0.08, WOOD_DARK);
  v.b(-4.35, 4.35, COUNTER.top - 0.12, COUNTER.top, COUNTER.back - 0.05, COUNTER.front + 0.25, WOOD_LIGHT);
  // 카운터 위 — 수저통, 양념통, 물컵
  v.c(-3.5, COUNTER.top + 0.2, -4.6, 0.3, 0.4, 0.3, '#3a2a1c');
  for (let i = 0; i < 4; i++) v.c(-3.58 + i * 0.05, COUNTER.top + 0.5, -4.62 + (i % 2) * 0.06, 0.03, 0.4, 0.03, '#c9a25a');
  v.c(3.3, COUNTER.top + 0.14, -4.6, 0.2, 0.28, 0.2, '#b23a26').c(3.3, COUNTER.top + 0.3, -4.6, 0.12, 0.05, 0.12, '#e8e0cf');
  v.c(3.62, COUNTER.top + 0.14, -4.6, 0.2, 0.28, 0.2, '#2c2a26').c(3.62, COUNTER.top + 0.3, -4.6, 0.12, 0.05, 0.12, '#e8e0cf');

  // 손님 의자
  for (const x of [-3, -1.5, 1.5, 3]) {
    v.c(x, 0.88, -3.3, 0.7, 0.12, 0.7, '#8a2f24');
    v.c(x, 0.42, -3.3, 0.14, 0.84, 0.14, '#2a2622').c(x, 0.04, -3.3, 0.5, 0.08, 0.5, '#2a2622');
  }

  // 뒤 조리대와 화구
  v.b(-4.2, 4.2, 0, 1.15, -9.7, -8.5, '#7b7f85').b(-4.3, 4.3, 1.15, 1.25, -9.75, -8.4, '#a8adb3');
  v.b(1.1, 2.9, 1.25, 1.35, -9.6, -8.6, '#2a2c30'); // 화구
  v.c(2.0, 1.75, -9.1, 1.1, 0.8, 0.9, '#8d9299').c(2.0, 2.17, -9.1, 1.2, 0.06, 1.0, '#b9bec4'); // 큰 솥
  v.c(2.0, 2.19, -9.1, 0.98, 0.04, 0.78, '#e6dcc0'); // 육수
  v.c(1.3, 1.8, -9.1, 0.14, 0.1, 0.1, '#55585d').c(2.7, 1.8, -9.1, 0.14, 0.1, 0.1, '#55585d');
  v.c(-1.6, 1.3, -9.0, 1.3, 0.1, 0.8, '#c9a25a'); // 도마
  v.c(-1.9, 1.4, -9.0, 0.5, 0.1, 0.4, '#f1e6c8').c(-1.2, 1.38, -8.9, 0.1, 0.05, 0.5, '#d0d4d8'); // 반죽, 칼
  v.c(-3.3, 1.55, -9.1, 0.6, 0.6, 0.6, '#3d5a80').c(-3.3, 1.88, -9.1, 0.66, 0.06, 0.66, '#2f4868'); // 통

  // 선반과 그릇, 병
  for (const y of [2.5, 3.3]) {
    v.b(-4.4, 4.4, y, y + 0.1, -9.95, -9.4, WOOD_DARK);
    for (let i = 0; i < 12; i++) {
      const x = -4.1 + i * 0.74;
      if ((i + (y > 3 ? 1 : 0)) % 3 === 0) {
        v.c(x, y + 0.36, -9.65, 0.2, 0.52, 0.2, ['#3f6b4a', '#7a3a2a', '#c9b06a'][i % 3]).c(x, y + 0.68, -9.65, 0.1, 0.14, 0.1, '#e8e0cf');
      } else {
        v.c(x, y + 0.19, -9.65, 0.5, 0.18, 0.4, '#ece5d5').c(x, y + 0.3, -9.65, 0.56, 0.06, 0.46, i % 2 ? INDIGO : '#b23a26');
      }
    }
  }
  // 벽에 건 나무 차림패
  for (let i = 0; i < 9; i++) {
    const x = -3.4 + i * 0.5;
    if (x > -0.9 && x < 0.9) continue;
    v.b(x, x + 0.34, 1.45, 2.3, -9.98, -9.94, jitter('#d9c39a', i, 0.04));
    v.b(x + 0.14, x + 0.2, 1.6, 2.15, -9.94, -9.93, '#3a2a1c');
  }

  // 천장 등 줄
  for (const x of [-2.6, 0, 2.6]) v.c(x, 3.72, -4.6, 0.04, 0.5, 0.04, '#1d1a18').c(x, 3.44, -4.6, 0.5, 0.1, 0.5, '#2a2622');
  g.add(v.mesh());

  const glow = new Vox();
  for (const x of [-2.6, 0, 2.6]) glow.c(x, 3.26, -4.6, 0.4, 0.26, 0.4, '#ffe2a6');
  glow.c(2.0, 1.33, -9.1, 0.9, 0.06, 0.7, '#ff8a3a'); // 불
  g.add(glow.mesh(GLOW));

  // 주방으로 통하는 문의 천
  const cloth = new Vox();
  cloth.b(-4.9, -3.6, 1.6, 3.0, -9.93, -9.9, '#8a2f24');
  g.add(cloth.mesh());
  const mark = textPlane(textTexture('면', 14, 14, { fg: '#f3ead6', size: 12 }), 0.7, 0.7, true);
  mark.position.set(-4.25, 2.3, -9.88);
  g.add(mark);
  return g;
}

// ── 주인장 ──────────────────────────────────────────────
export interface Owner {
  root: THREE.Group;
  /** 허리를 축으로 숙인다 */
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  /** 말풍선을 붙일 자리(머리 위) */
  anchor: THREE.Object3D;
}

export function buildOwner(): Owner {
  const SKIN = '#dba27c';
  const COAT = '#f1ede3';
  const root = new THREE.Group();

  const legs = new Vox();
  legs.c(0, 0.5, 0, 0.9, 1.0, 0.5, '#23262e');
  root.add(legs.mesh());

  const torso = new THREE.Group();
  torso.position.y = 1.0;
  root.add(torso);

  const body = new Vox();
  body.c(0, 0.6, 0, 1.1, 1.2, 0.62, COAT);
  body.c(-0.12, 0.98, 0.32, 0.14, 0.44, 0.03, '#d8d2c4').c(0.12, 0.98, 0.32, 0.14, 0.44, 0.03, '#d8d2c4'); // 깃
  body.c(0, 1.12, 0.32, 0.16, 0.16, 0.03, SKIN);
  body.c(0, 0.32, 0.33, 0.92, 0.66, 0.04, INDIGO); // 앞치마
  body.c(0, 0.68, 0.33, 1.12, 0.07, 0.05, '#1f2c57');
  body.c(0, 0.34, 0.36, 0.26, 0.26, 0.02, '#f3ead6'); // 앞치마 무늬
  torso.add(body.mesh());

  const head = new THREE.Group();
  head.position.y = 1.2;
  torso.add(head);
  const face = new Vox();
  face.c(0, 0.42, 0, 0.82, 0.8, 0.74, SKIN);
  face.c(0, 0.86, -0.02, 0.86, 0.14, 0.8, '#1c1917').c(0, 0.5, -0.36, 0.86, 0.66, 0.08, '#1c1917'); // 머리카락
  face.c(-0.42, 0.56, -0.1, 0.04, 0.4, 0.5, '#1c1917').c(0.42, 0.56, -0.1, 0.04, 0.4, 0.5, '#1c1917');
  face.c(0, 0.7, 0, 0.88, 0.15, 0.8, '#f6f2e8'); // 머리띠
  face.c(0.3, 0.7, 0.4, 0.1, 0.08, 0.02, '#b23a26');
  face.c(0.34, 0.6, -0.46, 0.14, 0.3, 0.08, '#f6f2e8').c(0.2, 0.74, -0.46, 0.2, 0.14, 0.1, '#f6f2e8'); // 매듭
  face.c(-0.2, 0.56, 0.37, 0.22, 0.06, 0.02, '#1c1917').c(0.2, 0.56, 0.37, 0.22, 0.06, 0.02, '#1c1917'); // 눈썹
  face.c(-0.2, 0.42, 0.37, 0.1, 0.12, 0.02, '#1c1917').c(0.2, 0.42, 0.37, 0.1, 0.12, 0.02, '#1c1917'); // 눈
  face.c(-0.3, 0.28, 0.37, 0.12, 0.07, 0.02, '#d08a72').c(0.3, 0.28, 0.37, 0.12, 0.07, 0.02, '#d08a72'); // 볼
  face.c(0, 0.2, 0.37, 0.2, 0.05, 0.02, '#6e2f22'); // 입
  face.c(-0.12, 0.23, 0.37, 0.05, 0.05, 0.02, '#6e2f22').c(0.12, 0.23, 0.37, 0.05, 0.05, 0.02, '#6e2f22'); // 입꼬리
  head.add(face.mesh());

  const makeArm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.68, 1.08, 0);
    const arm = new Vox();
    arm.c(0, -0.3, 0, 0.26, 0.66, 0.32, COAT).c(0, -0.6, 0, 0.3, 0.1, 0.36, '#d8d2c4').c(0, -0.76, 0, 0.22, 0.24, 0.26, SKIN);
    pivot.add(arm.mesh());
    torso.add(pivot);
    return pivot;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);

  const anchor = new THREE.Object3D();
  anchor.position.set(0, 1.25, 0);
  head.add(anchor);
  return { root, torso, head, armL, armR, anchor };
}

// ── 그릇 ────────────────────────────────────────────────
const TOPPING_CELLS: Record<Topping, Array<[number, number, number, string]>> = {
  // [x칸, z칸, 높이칸, 색] — 고명이 놓일 자리 기준
  egg: [[0, 0, 1, '#fbf7ea'], [1, 0, 1, '#fbf7ea'], [0, 1, 1, '#fbf7ea'], [1, 1, 1, '#fbf7ea'], [0.5, 0.5, 2, '#f2b632']],
  scallion: [[0, 0, 1, '#4f9a4a'], [1, 1, 1, '#6bb35f'], [-1, 1, 1, '#4f9a4a'], [0, -1, 1, '#6bb35f']],
  gim: [[0, 0, 3, '#1b2420'], [1, 0, 3, '#1b2420'], [0, 0.4, 2, '#26302b']],
  chili: [[0, 0, 1, '#d2331f'], [1, 0, 1, '#e04a2d'], [1, 1, 1, '#d2331f']],
  cucumber: [[0, 0, 1, '#9fd08a'], [1, 0, 1, '#7dbd6c'], [2, 0, 1, '#9fd08a'], [0, 1, 1, '#7dbd6c'], [1, 1, 1, '#9fd08a']],
  kimchi: [[0, 0, 1, '#d9512f'], [1, 0, 2, '#e56a3c'], [0, 1, 2, '#c8401f'], [1, 1, 1, '#f0d9b0']],
  sesame: [[0, 0, 1, '#e9d9a8'], [1.4, 0.6, 1, '#e9d9a8'], [-0.8, 1.2, 1, '#d9c690']],
  zucchini: [[0, 0, 1, '#b7d67a'], [1, 0, 1, '#8fbf5c'], [0, 1, 1, '#8fbf5c'], [1, 1, 1, '#b7d67a']],
  fishcake: [[0, 0, 1, '#fbf3e6'], [1, 0, 1, '#fbf3e6'], [0.5, 0, 2, '#f08fa3']],
  ice: [[0, 0, 2, '#cfeaf5'], [1.2, 0.8, 2, '#e3f4fa']],
  sauce: [[0, 0, 1, '#b5281c'], [1, 0, 1, '#c4331f'], [0, 1, 1, '#c4331f'], [1, 1, 2, '#b5281c']],
};

/** 블록으로 쌓은 국수 한 그릇. 지름 약 1 */
export function buildBowl(spec: BowlSpec): THREE.Group {
  const g = new THREE.Group();
  const v = new Vox();
  const s = 0.1;
  const cell = (i: number, j: number, y0: number, y1: number, color: string) =>
    v.b(i * s - s / 2, i * s + s / 2, y0, y1, j * s - s / 2, j * s + s / 2, color);

  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const r = Math.hypot(i, j);
      if (r <= 2.6) cell(i, j, 0, 0.1, '#d8d0c0'); // 굽
      if (r <= 3.7) cell(i, j, 0.1, 0.24, '#f2ecdf');
      if (r <= 4.6 && r > 3.5) cell(i, j, 0.24, 0.4, '#f2ecdf');
      if (r <= 5.3 && r > 4.3) cell(i, j, 0.4, 0.5, INDIGO); // 전
      if (r <= 4.4 && r > 3.5) cell(i, j, 0.4, 0.44, '#e4dccb');
      if (r <= 4.4) cell(i, j, 0.24, 0.42, spec.broth);
      // 면 — 국물 위로 살짝 올라온 가닥
      if (r <= 3.2 && (i + j * 2 + 20) % 3 !== 0) cell(i, j, 0.42, 0.46, jitter(spec.noodle, i * 7 + j, 0.04));
    }
  }
  const n = spec.toppings.length;
  spec.toppings.forEach((name, k) => {
    const angle = (k / n) * Math.PI * 2 + 0.6;
    const radius = n === 1 ? 0 : 1.9;
    const ox = Math.round(Math.cos(angle) * radius);
    const oz = Math.round(Math.sin(angle) * radius);
    for (const [dx, dz, h, color] of TOPPING_CELLS[name]) {
      v.b((ox + dx) * s - s / 2, (ox + dx) * s + s / 2, 0.46, 0.46 + h * 0.05, (oz + dz) * s - s / 2, (oz + dz) * s + s / 2, color);
    }
  });
  g.add(v.mesh());
  return g;
}

/** 젓가락 한 벌과 받침 */
export function buildChopsticks(): THREE.Mesh {
  const v = new Vox();
  v.c(0, 0.04, 0.35, 0.3, 0.08, 0.12, '#f2ecdf');
  v.c(-0.05, 0.1, 0, 0.04, 0.04, 1.1, '#2c1d12').c(0.05, 0.1, 0, 0.04, 0.04, 1.1, '#2c1d12');
  return v.mesh();
}

/** 카운터에 올려 주는 차림표 */
export function buildMenuBoard(): THREE.Group {
  const g = new THREE.Group();
  const v = new Vox();
  v.c(0, 0, 0, 0.9, 1.2, 0.06, '#b5321f').c(0, 0, 0.035, 0.74, 1.04, 0.02, '#f3ead6');
  for (let i = 0; i < 6; i++) v.c(-0.05 + (i % 2) * 0.06, 0.34 - i * 0.14, 0.05, 0.5 - (i % 3) * 0.08, 0.04, 0.01, '#3a2a1c');
  g.add(v.mesh());
  return g;
}
