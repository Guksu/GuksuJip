/** 국숫집 장면. 옆에서 본 픽셀 가게를 작게 그린 뒤 정수배로 늘린다.
 *  화면의 글과 버튼은 React가 맡고, 여기는 "들어가라, 이 메뉴를 내라" 같은 명령만 받는다. */
import { categories, menu, menuByCategory, type MenuItem } from '../data/menu';
import { FONT, INK, Pen, drawSprite, makeGlow, makeSprite, textSprite, type Sprite } from './paint';
import {
  CHEF,
  FRONT,
  INDIGO,
  INSIDE,
  makeChef,
  makeFront,
  makeGuest,
  makeInsideBack,
  makeInsideFront,
  makeChopstickBox,
  makeKettle,
  makeLamp,
  makeMenuStrips,
  makeSideBowl,
  makePaperLantern,
  makePot,
  makeStool,
  paintBigPot,
  type ChefPose,
} from './shopart';
import { CUT_NAMES, RECIPES, recipeOf, type Cut } from './recipes';
import { bowlHeight, makeBowl, makeCat } from './sprites';

/** 가게에서 지금 벌어지는 일 */
export type Phase = 'outside' | 'entering' | 'greeting' | 'menu' | 'cooking' | 'served';

export interface StageOptions {
  canvas: HTMLCanvasElement;
  reduceMotion: boolean;
  onPhase: (phase: Phase) => void;
  /** 주인장이 하는 말. null이면 대화창을 치운다 */
  onSay: (line: string | null) => void;
  /** 가게 앞 고양이를 눌렀을 때 */
  onCat: () => void;
}

export interface Stage {
  /** 노렌을 걷고 들어가 인사를 받고 차림표를 받는다 */
  enter(): void;
  /** 가게 앞과 인사를 건너뛰고 차림표부터 본다 */
  skipToMenu(): void;
  /** 주문한 메뉴를 만들어서 낸다. instant면 만드는 장면 없이 바로 놓는다 */
  serve(item: MenuItem, instant?: boolean): void;
  /** 그릇을 치우고 차림표로 돌아간다 */
  backToMenu(): void;
  /** 가게 밖으로 나간다 */
  leave(): void;
  /** 지금까지 맛본 메뉴. 카운터 한쪽에 빈 그릇으로 쌓인다 */
  setTasted(slugs: readonly string[]): void;
  /** 진행 중인 연출을 빨리 감는다 */
  hurry(): void;
  dispose(): void;
}

const SKY = ['#10142e', '#161b3c', '#1d2450', '#273063', '#343d78'];
/** 요리 장면의 길이(초). 국수마다 정한 세 컷이 지나가고 완성 컷으로 끝난다 */
const CUT_TIME = 1.0;
const DONE_TIME = 1.2;
const COOK_TIME = CUT_TIME * 3 + DONE_TIME;

/** 화면 크기에 맞는 픽셀 배율 */
function pixelScale(cssWidth: number, cssHeight: number): number {
  return Math.max(2, Math.min(8, Math.floor(Math.min(cssHeight / 190, cssWidth / 120))));
}

export async function createStage(options: StageOptions): Promise<Stage> {
  const { canvas, reduceMotion } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('캔버스를 쓸 수 없다');
  // 간판 글씨를 그리기 전에 픽셀 글꼴을 기다린다
  await document.fonts.load(FONT, '국수집').catch(() => undefined);

  /* ── 그림 준비 ── */
  const chef: Record<ChefPose, Sprite> = { idle: makeChef('idle'), blink: makeChef('blink'), talk: makeChef('talk'), present: makeChef('present') };
  const front = makeFront();
  const insideFront = makeInsideFront();
  let insideBack: Sprite | null = null;
  // 벽의 쪽지는 차림과 같은 순서로, 분류별로 묶어 건다
  const grouped = categories.map((category) => menuByCategory(category.id));
  const stripOrder = grouped.flat();
  const strips = makeMenuStrips(grouped.map((group) => group.map((item) => item.dish)));
  const chopsticks = makeChopstickBox();
  const kettle = makeKettle();
  const sideBowl = makeSideBowl();
  const lamp = makeLamp();
  const pot = makePot();
  const stool = makeStool();
  const guests = [makeGuest('#2c2230', '#6f8fa8'), makeGuest('#6b3f2a', '#b9a25a'), makeGuest('#3a2a26', '#8a7fa8')];
  const lanterns = [makePaperLantern('국수'), makePaperLantern('한상')];
  const cat = makeCat();
  const glowLamp = makeGlow(22, '#ffd27a');
  const glowSmall = makeGlow(12, '#ffd27a');
  const servedBowls = new Map<string, Sprite>();
  const bigBowls = new Map<string, Sprite>();
  const bowlOf = (cache: Map<string, Sprite>, item: MenuItem, r: number) => {
    let sprite = cache.get(item.slug);
    if (!sprite) {
      sprite = makeBowl(item.bowl, r, INDIGO);
      cache.set(item.slug, sprite);
    }
    return sprite;
  };
  const emptyBowl = makeSprite(
    13,
    8,
    (pen) => {
      pen.rect(0, 0, 13, 2, '#fbf6ea');
      pen.rect(1, 2, 11, 3, '#fbf6ea');
      pen.rect(1, 3, 11, 1, INDIGO);
      pen.rect(3, 5, 7, 2, '#d8cdb8');
      pen.rect(9, 2, 3, 3, '#d8cdb8');
    },
    INK,
  );
  const caption = (words: string) => textSprite(words, '#f6eedb', INK);
  const captions: Record<Cut | 'done', Sprite> = {
    boil: caption(CUT_NAMES.boil),
    chop: caption(CUT_NAMES.chop),
    rinse: caption(CUT_NAMES.rinse),
    wok: caption(CUT_NAMES.wok),
    plate: caption(CUT_NAMES.plate),
    done: caption('완성'),
  };
  const names = new Map<string, Sprite>();

  const stars = Array.from({ length: 40 }, (_, i) => ({ x: ((i * 7919) % 1000) / 1000, y: ((i * 104729) % 520) / 1000, phase: i * 1.7 }));
  const flakes = Array.from({ length: reduceMotion ? 0 : 60 }, (_, i) => ({
    x: ((i * 7919) % 1000) / 1000,
    y: ((i * 104729) % 1000) / 1000,
    speed: 0.05 + ((i * 31) % 10) / 160,
    size: i % 5 === 0 ? 2 : 1,
  }));

  /* ── 상태 ── */
  let scale = 3;
  let W = 320;
  let H = 200;
  let cssW = 1;
  let cssH = 1;
  let phase: Phase = 'outside';
  let inside = false;
  let time = 0;
  let last = 0;
  let frame = 0;
  let disposed = false;
  /** 장면이 바뀔 때 닫혔다 열리는 막. 0이면 열림, 1이면 닫힘 */
  let curtain = 0;
  let talking = 0;
  let served: MenuItem | null = null;
  let cooking: { item: MenuItem; t: number } | null = null;
  let tasted: string[] = [];
  let catHop = 0;
  /** 패널이 가린 만큼 장면을 비켜 놓은 양(그림 칸) */
  const offset = { x: 0, y: 0 };

  /* ── 차례로 처리하는 연출 ── */
  let token = 0;
  let hurried = false;
  const waits: { left: number; done: () => void }[] = [];
  const wait = (seconds: number) =>
    new Promise<void>((done) => {
      if (reduceMotion || seconds <= 0) done();
      else waits.push({ left: seconds, done });
    });
  const setPhase = (next: Phase) => {
    phase = next;
    options.onPhase(next);
  };
  const say = (line: string | null) => {
    if (line) talking = 0.9;
    options.onSay(line);
  };
  /** 막을 닫고 장면을 바꾼 뒤 다시 연다 */
  const swap = async (toInside: boolean, mine: number) => {
    if (inside === toInside) return;
    if (!reduceMotion) {
      for (let t = 0; t < 1 && mine === token && !hurried; t += 0.1) {
        curtain = t;
        await wait(0.03);
      }
    }
    inside = toInside;
    curtain = reduceMotion ? 0 : 1;
    if (!reduceMotion) {
      for (let t = 1; t > 0 && mine === token && !hurried; t -= 0.1) {
        curtain = t;
        await wait(0.03);
      }
    }
    curtain = 0;
  };
  const begin = () => {
    token += 1;
    hurried = false;
    waits.splice(0).forEach((entry) => entry.done());
    cooking = null;
    curtain = 0;
    return token;
  };

  /* ── 화면 크기 ── */
  const portrait = () => cssW < 900 && cssH > cssW;
  const resize = () => {
    const box = canvas.parentElement ?? canvas;
    cssW = Math.max(1, box.clientWidth);
    cssH = Math.max(1, box.clientHeight);
    scale = pixelScale(cssW, cssH);
    W = Math.ceil(cssW / scale);
    H = Math.ceil(cssH / scale);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    ctx.imageSmoothingEnabled = false;
    insideBack = makeInsideBack(Math.max(150, H));
    const want = wantOffset();
    offset.x = want.x;
    offset.y = want.y;
  };
  /** 차림과 소개 패널이 가리는 자리를 피해 주인장이 보이게 한다 */
  const wantOffset = () => {
    if (!inside || (phase !== 'menu' && phase !== 'served' && phase !== 'cooking')) return { x: 0, y: 0 };
    if (portrait()) return { x: 0, y: -Math.round(H * 0.62) + INSIDE.counter + INSIDE.floor - 4 };
    const panel = phase === 'menu' ? Math.min(760, cssW * 0.56) : Math.min(680, cssW * 0.52);
    return { x: -Math.round((panel + 16) / scale / 2), y: 0 };
  };

  /* ── 그리기 ── */
  const glow = (sprite: Sprite, x: number, y: number) => {
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(sprite.img, Math.round(x - sprite.w / 2), Math.round(y - sprite.h / 2));
    ctx.globalCompositeOperation = 'source-over';
  };
  const steam = (x: number, y: number, seed: number, strong: boolean) => {
    if (reduceMotion) return;
    ctx.fillStyle = 'rgba(255, 250, 240, 0.6)';
    const count = strong ? 6 : 3;
    for (let i = 0; i < count; i += 1) {
      const t = (time * 0.45 + seed * 0.31 + i / count) % 1;
      const sx = x + Math.round(Math.sin((t + i) * 6.3 + seed) * 3) + (i - count / 2) * 3;
      const size = t < 0.4 ? 3 : t < 0.7 ? 2 : 1;
      ctx.fillRect(Math.round(sx), Math.round(y - t * 22), size, size);
    }
  };

  const drawOutside = () => {
    const ground = H - 22;
    for (let y = 0; y < ground; y += 1) {
      ctx.fillStyle = SKY[Math.min(SKY.length - 1, Math.floor((y / ground) ** 1.6 * SKY.length))];
      ctx.fillRect(0, y, W, 1);
    }
    for (const star of stars) {
      if (!reduceMotion && Math.sin(time * 1.4 + star.phase) < -0.4) continue;
      ctx.fillStyle = '#c9c8e8';
      ctx.fillRect(Math.round(star.x * W), Math.round(star.y * ground), 1, 1);
    }
    // 뒤쪽 건물
    ctx.fillStyle = '#141833';
    for (let x = -10, i = 0; x < W; x += 46, i += 1) ctx.fillRect(x, ground - 70 - ((i * 37) % 40), 40, 120);
    // 땅과 쌓인 눈
    ctx.fillStyle = '#2a2a3c';
    ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = '#3a3a50';
    ctx.fillRect(0, ground, W, 2);
    const cx = Math.round(W / 2);
    drawSprite(ctx, front, cx - FRONT.width / 2, ground - FRONT.height + 2);
    ctx.fillStyle = '#e8eef6';
    for (let x = 6, i = 0; x < W; x += 38, i += 1) ctx.fillRect(x, ground + 6 + (i % 3) * 4, 16 + (i % 2) * 8, 2);
    // 문 앞 디딤돌
    ctx.fillStyle = '#4a4a62';
    ctx.fillRect(cx - 18, ground + 4, 36, 4);
    ctx.fillRect(cx - 22, ground + 12, 44, 5);
    // 초롱과 불빛
    const sway = reduceMotion ? 0 : Math.round(Math.sin(time * 1.5) * 0.7);
    drawSprite(ctx, lanterns[0], cx - FRONT.door - 22 + sway, ground - 84);
    drawSprite(ctx, lanterns[1], cx + FRONT.door + 8 - sway, ground - 84);
    glow(glowLamp, cx - FRONT.door - 15, ground - 66);
    glow(glowLamp, cx + FRONT.door + 15, ground - 66);
    glow(glowLamp, cx, ground - 30);
    // 고양이
    const hop = catHop > 0 ? Math.round(Math.sin((catHop / 0.45) * Math.PI) * 6) : 0;
    drawSprite(ctx, cat[time % 2.4 < 0.5 ? 1 : 0], cx + 70, ground - 29 - hop);
    // 눈
    ctx.fillStyle = '#eef3fa';
    for (const flake of flakes) {
      const y = ((flake.y + time * flake.speed) % 1) * H;
      const x = (flake.x + Math.sin(time * 0.6 + flake.y * 9) * 0.01) * W;
      ctx.fillRect(Math.round(x), Math.round(y), flake.size, flake.size);
    }
  };

  const drawInside = () => {
    if (!insideBack) return;
    const cx = Math.round(W / 2 + offset.x);
    const floorY = H - INSIDE.floor + Math.round(offset.y);
    const counterY = floorY - INSIDE.counter;
    const left = cx - INSIDE.width / 2;
    ctx.fillStyle = '#4a3226';
    ctx.fillRect(0, 0, W, H);
    drawSprite(ctx, insideBack, left, floorY - insideBack.h);

    // 벽의 차림 쪽지 — 맛본 국수에는 남색 표시가 찍힌다
    const stripsX = cx - Math.round(strips.sprite.w / 2);
    const stripsY = Math.round(offset.y) + 16;
    drawSprite(ctx, strips.sprite, stripsX, stripsY);
    stripOrder.forEach((item, i) => {
      if (!tasted.includes(item.slug)) return;
      const mark = strips.marks[i];
      ctx.fillStyle = INDIGO;
      ctx.fillRect(stripsX + mark.x, stripsY + mark.y, 7, 7);
      ctx.fillStyle = '#f6eedb';
      ctx.fillRect(stripsX + mark.x + 1, stripsY + mark.y + 3, 2, 2);
      ctx.fillRect(stripsX + mark.x + 3, stripsY + mark.y + 4, 1, 1);
      ctx.fillRect(stripsX + mark.x + 4, stripsY + mark.y + 2, 1, 2);
      ctx.fillRect(stripsX + mark.x + 5, stripsY + mark.y + 1, 1, 1);
    });

    // 솥과 김
    drawSprite(ctx, pot, cx + 56, counterY - 28);
    steam(cx + 73, counterY - 30, 3, phase === 'cooking');

    // 주인장 — 말할 때 입을 벌리고, 가끔 눈을 깜빡인다
    const bob = !reduceMotion && Math.sin(time * 2) > 0.7 ? 1 : 0;
    const pose: ChefPose =
      phase === 'served' ? 'present' : talking > 0 && Math.floor(time * 8) % 2 === 0 ? 'talk' : time % 3.6 < 0.12 ? 'blink' : 'idle';
    drawSprite(ctx, chef[pose], cx - CHEF.w / 2, counterY - CHEF.h + 6 + bob);

    // 카운터
    drawSprite(ctx, insideFront, left, counterY);

    // 카운터 위의 수저통, 주전자, 손님 앞의 그릇
    drawSprite(ctx, chopsticks, cx - 112, counterY - 12);
    drawSprite(ctx, chopsticks, cx + 36, counterY - 12);
    drawSprite(ctx, kettle, cx + 100, counterY - 13);
    for (const dx of [-132, -84, 84, 132]) {
      drawSprite(ctx, sideBowl, cx + dx - 6, counterY - 7);
      steam(cx + dx, counterY - 8, dx, false);
    }

    // 맛본 그릇은 카운터 왼쪽에 쌓인다
    tasted.forEach((_, i) => {
      const column = Math.floor(i / 4);
      drawSprite(ctx, emptyBowl, cx - 60 + column * 17, counterY - 7 - (i % 4) * 4);
    });

    // 내놓은 그릇
    if (served && phase === 'served') {
      const bowl = bowlOf(servedBowls, served, 20);
      // 주인장 얼굴을 가리지 않게 옆으로 비켜 놓는다
      drawSprite(ctx, bowl, cx - 20, counterY - bowl.h + 14);
      steam(cx, counterY - bowl.h + 12, 9, true);
    }

    // 등과 불빛
    // 등은 쪽지 묶음 사이 빈자리로 줄을 내려서 쪽지를 가리지 않게 단다
    const lampXs = [strips.gaps[0], strips.gaps[strips.gaps.length - 1]].map((x) => cx - Math.round(strips.sprite.w / 2) + Math.round(x));
    for (const lampX of lampXs) {
      const lampY = counterY - 62;
      ctx.fillStyle = INK;
      ctx.fillRect(lampX, Math.round(offset.y), 1, lampY - Math.round(offset.y));
      drawSprite(ctx, lamp, lampX - 7, lampY - 12);
      glow(glowLamp, lampX, lampY + 8);
    }
    glow(glowSmall, cx + 73, counterY - 14);

    // 손님과 의자
    [-132, -84, 0, 84, 132].forEach((dx, i) => {
      drawSprite(ctx, stool, cx + dx - 8, floorY - 14);
      if (i === 2) return;
      const guest = guests[i % guests.length];
      const sway = !reduceMotion && Math.sin(time * 1.3 + i) > 0.8 ? 1 : 0;
      drawSprite(ctx, guest, cx + dx - 9, floorY - 14 - guest.h + 2 + sway);
    });
  };

  /** 요리를 만드는 장면. 화면 전체를 쓰는 짧은 컷이 이어지고, 어떤 컷이 나올지는 국수마다 정해져 있다 */
  const drawCooking = (item: MenuItem, t: number) => {
    // 그림은 두 배로 키워서 가까이서 본 것처럼 그린다
    const zoom = 2;
    const vw = W / zoom;
    const vh = H / zoom;
    const cx = Math.round(vw / 2);
    const cy = Math.round(vh / 2);
    const band = Math.max(14, Math.round(H * 0.11));
    const cuts = RECIPES[recipeOf(item.slug)];
    const index = Math.min(cuts.length, Math.floor(t / CUT_TIME));
    const cut: Cut | 'done' = index < cuts.length ? cuts[index] : 'done';
    const local = t - index * CUT_TIME;
    const pen = new Pen(ctx);
    const backdrop = { boil: '#3b4a6b', chop: '#6b5a3a', rinse: '#2f5f6b', wok: '#3a2a26', plate: '#4a3f5c', done: '#1f2c57' }[cut];
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, W, H);
    // 뒤로 흐르는 빗금 — 컷마다 방향이 바뀐다
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    const lean = index % 2 === 0 ? 1 : -1;
    ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
    for (let i = -H; i < W + H; i += 18) {
      const x0 = i + ((time * 60 * lean) % 18);
      for (let y = 0; y < H; y += 2) ctx.fillRect(Math.round(x0 + y * 0.5 * lean), y, 6, 2);
    }

    if (cut === 'boil') {
      // 끓는 솥에 면이 내려간다
      paintBigPot(pen, cx, cy + 10, 46);
      const drop = Math.min(1, local / 0.5);
      for (let i = 0; i < 9; i += 1) {
        const x = cx - 24 + i * 6;
        const wave = Math.round(Math.sin(time * 9 + i) * 2);
        pen.rect(x + wave, cy - 60 + drop * 50, 2, 26 + (i % 3) * 4, item.bowl.noodle);
      }
      for (let i = 0; i < 7; i += 1) {
        const phaseT = (time * 1.6 + i * 0.37) % 1;
        const bx = cx - 34 + ((i * 53) % 68);
        pen.rect(bx, cy + 12 - phaseT * 6, phaseT < 0.5 ? 4 : 2, phaseT < 0.5 ? 4 : 2, '#ffffff');
      }
      steam(cx - 20, cy - 20, 1, true);
      steam(cx + 22, cy - 16, 5, true);
    } else if (cut === 'chop') {
      // 도마 위에서 칼이 오르내린다
      pen.rect(cx - 70, cy + 6, 140, 12, '#d9a566');
      pen.rect(cx - 70, cy + 18, 140, 5, '#a86a3c');
      pen.rect(cx - 70, cy + 6, 140, 2, '#ecc48a');
      const beat = (local * 6) % 1;
      const cutCount = Math.floor(local * 6);
      // 파 한 대 — 썬 만큼 조각으로 흩어진다
      const stalk = Math.max(0, 80 - cutCount * 12);
      pen.rect(cx - 60 + (80 - stalk), cy - 2, stalk, 8, '#5f9a4a');
      pen.rect(cx - 60 + (80 - stalk), cy - 2, stalk, 2, '#8fcf6a');
      for (let i = 0; i < cutCount; i += 1) {
        pen.rect(cx - 62 + i * 9, cy + 1 - (i % 2) * 3, 6, 5, '#6fb85a');
        pen.rect(cx - 61 + i * 9, cy + 2 - (i % 2) * 3, 3, 2, '#d6efb0');
      }
      const knifeY = cy - 44 + (beat < 0.5 ? beat * 2 : 1) * 34;
      const knifeX = cx - 60 + (80 - stalk) - 4;
      pen.rect(knifeX, knifeY, 6, 30, '#dfe4e8');
      pen.rect(knifeX, knifeY, 2, 30, '#ffffff');
      pen.rect(knifeX - 1, knifeY - 16, 8, 16, '#5a3a2c');
      if (beat > 0.5 && beat < 0.7) {
        pen.rect(knifeX - 10, cy - 6, 4, 2, '#ffffff');
        pen.rect(knifeX + 12, cy - 8, 4, 2, '#ffffff');
      }
    } else if (cut === 'rinse') {
      // 체에 받친 면 위로 찬물이 떨어지고, 얼음이 굴러 들어온다
      const shake = reduceMotion ? 0 : Math.round(Math.sin(time * 18) * 1.5);
      const sx = cx + shake;
      // 물줄기와 튀는 물
      pen.rect(cx - 5, 0, 10, cy - 8, '#bfe6f5');
      pen.rect(cx - 5, 0, 3, cy - 8, '#e8f7fd');
      for (let i = 0; i < 8; i += 1) {
        const k = (time * 2.4 + i / 8) % 1;
        const dir = i % 2 === 0 ? 1 : -1;
        pen.rect(cx + dir * (8 + k * 34), cy - 10 - Math.sin(k * Math.PI) * 14, 3, 3, '#e8f7fd');
      }
      // 체 — 테두리, 그물, 손잡이
      pen.ellipse(sx, cy + 2, 50, 12, '#8f959c');
      pen.ellipse(sx, cy + 2, 46, 9, item.bowl.noodle);
      for (let i = 0; i < 10; i += 1) {
        const wave = Math.round(Math.sin(time * 8 + i * 1.3) * 2);
        pen.rect(sx - 38 + i * 8 + wave, cy - 2 + (i % 3), 6, 2, 'rgba(0, 0, 0, 0.14)');
      }
      for (let dy = 0; dy < 26; dy += 1) {
        const half = Math.round(50 * Math.sqrt(1 - (dy / 27) ** 2));
        pen.rect(sx - half, cy + 6 + dy, half * 2 + 1, 1, dy % 4 < 2 ? '#a9afb5' : '#8f959c');
      }
      for (let x = -40; x <= 40; x += 10) pen.rect(sx + x, cy + 8, 1, 20, '#6f757c');
      pen.rect(sx + 48, cy - 1, 34, 6, '#5a3a2c');
      pen.rect(sx + 48, cy - 1, 34, 2, '#7a5238');
      // 체 아래로 빠지는 물
      for (let i = 0; i < 6; i += 1) {
        const k = (time * 2 + i * 0.17) % 1;
        pen.rect(sx - 30 + i * 12, cy + 34 + k * 20, 2, 5, '#bfe6f5');
      }
      // 얼음
      const ice = Math.min(1, Math.max(0, (local - 0.35) / 0.4));
      for (let i = 0; i < 4; i += 1) {
        const ix = sx - 26 + i * 16;
        const iy = cy - 6 - (1 - ice) * (60 + i * 14);
        pen.rect(ix, iy, 9, 9, '#d5eefa');
        pen.rect(ix, iy, 9, 2, '#ffffff');
        pen.rect(ix + 6, iy + 2, 3, 7, '#a9d6ea');
      }
    } else if (cut === 'wok') {
      // 불 위에서 웍을 돌린다. 재료가 포물선을 그리며 떴다가 떨어진다
      const toss = (local * 2.4) % 1;
      const tilt = reduceMotion ? 0 : Math.sin(toss * Math.PI * 2) * 5;
      const wy = cy - 2;
      // 불꽃 — 아래에서 솟는 세모 여러 개
      for (let i = 0; i < 9; i += 1) {
        const flick = reduceMotion ? 14 : 12 + Math.abs(Math.sin(time * 11 + i * 1.9)) * 18;
        const fx = cx - 44 + i * 11;
        for (let h = 0; h < flick; h += 2) {
          const half = Math.max(1, Math.round((1 - h / flick) * 5));
          pen.rect(fx - half, wy + 50 - h, half * 2, 2, h < flick * 0.45 ? '#ffe9a6' : '#f2a03a');
        }
      }
      // 웍 — 깊은 검은 그릇과 손잡이
      for (let dy = 0; dy < 26; dy += 1) {
        const half = Math.round(56 * Math.sqrt(1 - (dy / 27) ** 2));
        pen.rect(cx - half, wy + dy + Math.round((tilt * dy) / 26), half * 2 + 1, 1, dy < 3 ? '#4a4650' : '#2a262e');
      }
      pen.ellipse(cx, wy, 56, 8, '#4a4650');
      pen.ellipse(cx, wy + 1, 51, 6, item.bowl.broth);
      pen.rect(cx + 54, wy - 4 - tilt, 40, 6, '#2a262e');
      pen.rect(cx + 78, wy - 5 - tilt, 16, 8, '#5a3a2c');
      // 떠오른 면과 재료
      const rise = Math.sin(toss * Math.PI);
      for (let i = 0; i < 10; i += 1) {
        const spread = (i - 4.5) * 8;
        const y = wy - 6 - rise * (26 + (i % 3) * 8);
        pen.rect(cx + spread + Math.round(Math.sin(time * 6 + i) * 2), y, 7, 2, item.bowl.noodle);
      }
      const bits = ['#6fb85a', '#f6eedb', '#c9793a', '#6fb85a', '#e8d6a0'];
      bits.forEach((color, i) => {
        const y = wy - 10 - rise * (34 + i * 6);
        pen.rect(cx - 30 + i * 15, y, 4, 4, color);
      });
      steam(cx - 24, wy - 30, 2, true);
      steam(cx + 26, wy - 34, 7, true);
    } else {
      // 그릇이 내려와 앉는다. 완성 컷에서는 뒤에서 빛살이 돈다
      const bowl = bowlOf(bigBowls, item, 30);
      if (cut === 'done') {
        ctx.fillStyle = 'rgba(246, 238, 219, 0.14)';
        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * Math.PI * 2 + (reduceMotion ? 0 : time * 0.6);
          for (let r = 34; r < Math.max(vw, vh); r += 3) {
            const width = Math.max(2, Math.round(r * 0.16));
            ctx.fillRect(Math.round(cx + Math.cos(angle) * r - width / 2), Math.round(cy - 6 + Math.sin(angle) * r - width / 2), width, width);
          }
        }
      }
      const fall = cut === 'plate' ? Math.min(1, local / 0.35) : 1;
      const bounce = cut === 'plate' && local > 0.35 && local < 0.55 ? Math.round(Math.sin(((local - 0.35) / 0.2) * Math.PI) * 4) : 0;
      const y = cy - bowlHeight(30) / 2 - 6 - (1 - fall * fall) * 90 - bounce;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(cx - 26, cy + 24, 52, 4);
      drawSprite(ctx, bowl, cx - 30, y);
      if (fall >= 1) steam(cx, y + 4, 4, true);
      if (cut === 'done') {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let name = names.get(item.slug);
        if (!name) {
          name = textSprite(`${item.dish} · ${item.name}`, '#f6eedb', INK);
          names.set(item.slug, name);
        }
        drawSprite(ctx, name, Math.round(W / 2 - name.w / 2), H - band - name.h - 6);
      }
    }

    // 위아래 검은 띠와 컷 이름
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0c0a12';
    ctx.fillRect(0, 0, W, band);
    ctx.fillRect(0, H - band, W, band);
    const label = captions[cut];
    drawSprite(ctx, label, Math.round(W / 2 - label.w / 2), H - band + Math.round((band - label.h) / 2));
    // 컷이 바뀌는 순간 흰 번쩍임
    if (!reduceMotion && local < 0.08) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(0, band, W, H - band * 2);
    }
  };

  const draw = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (cooking) drawCooking(cooking.item, cooking.t);
    else if (inside) drawInside();
    else drawOutside();
    if (curtain > 0) {
      // 위아래에서 닫히는 막
      const cover = Math.ceil((H / 2) * Math.min(1, curtain));
      ctx.fillStyle = '#0c0a12';
      ctx.fillRect(0, 0, W, cover);
      ctx.fillRect(0, H - cover, W, cover);
    }
  };

  const loop = (now: number) => {
    if (disposed) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000 || 0));
    last = now;
    time += dt;
    if (talking > 0) talking -= dt;
    if (catHop > 0) catHop -= dt;
    if (cooking) cooking.t = Math.min(COOK_TIME, cooking.t + dt);
    for (let i = waits.length - 1; i >= 0; i -= 1) {
      waits[i].left -= hurried ? Infinity : dt;
      if (waits[i].left <= 0) waits.splice(i, 1)[0].done();
    }
    const want = wantOffset();
    const ease = reduceMotion ? 1 : Math.min(1, dt * 7);
    offset.x += (want.x - offset.x) * ease;
    offset.y += (want.y - offset.y) * ease;
    draw();
    frame = requestAnimationFrame(loop);
  };

  /* ── 누르기 ── */
  const onClick = (event: MouseEvent) => {
    if (phase !== 'outside') {
      if (phase === 'entering' || phase === 'greeting' || phase === 'cooking') hurried = true;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    const cx = W / 2;
    const ground = H - 22;
    if (Math.abs(x - cx) < FRONT.door + 4 && y > ground - 80 && y < ground + 4) api.enter();
    else if (x > cx + 66 && x < cx + 90 && y > ground - 34 && y < ground - 14) {
      if (catHop <= 0 && !reduceMotion) catHop = 0.45;
      options.onCat();
    }
  };

  /* ── 바깥에 내놓는 명령 ── */
  const api: Stage = {
    enter() {
      if (phase !== 'outside') return;
      const mine = begin();
      setPhase('entering');
      void (async () => {
        await swap(true, mine);
        if (mine !== token) return;
        setPhase('greeting');
        say('어서 오세요.\n편한 자리에 앉으세요.');
        await wait(1.6);
        if (mine !== token) return;
        say('벽에 붙은 게 오늘 차림이에요.\n고르시면 바로 삶을게요.');
        setPhase('menu');
      })();
    },
    skipToMenu() {
      begin();
      inside = true;
      served = null;
      say('천천히 고르세요.');
      setPhase('menu');
    },
    serve(item, instant = false) {
      const mine = begin();
      inside = true;
      served = item;
      if (instant || reduceMotion) {
        say(null);
        setPhase('served');
        return;
      }
      setPhase('cooking');
      say(`${item.dish} 하나요.\n금방 내올게요.`);
      void (async () => {
        await wait(0.7);
        if (mine !== token) return;
        // 만드는 장면에서는 대화창을 치워서 화면을 다 쓴다
        say(null);
        cooking = { item, t: 0 };
        await wait(COOK_TIME);
        if (mine !== token) return;
        cooking = null;
        say(null);
        setPhase('served');
      })();
    },
    backToMenu() {
      begin();
      inside = true;
      served = null;
      say(tasted.length >= menu.length ? '차림을 다 드셨네요.\n계산서 챙겨 가세요.' : '입에 맞으셨어요?\n다른 것도 드셔 보세요.');
      setPhase('menu');
    },
    leave() {
      const mine = begin();
      served = null;
      say(null);
      setPhase('outside');
      void swap(false, mine);
    },
    setTasted(slugs) {
      tasted = [...slugs];
    },
    hurry() {
      hurried = true;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('click', onClick);
      waits.splice(0).forEach((entry) => entry.done());
    },
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement ?? canvas);
  canvas.addEventListener('click', onClick);
  resize();
  last = performance.now();
  frame = requestAnimationFrame(loop);

  return api;
}
