import * as THREE from 'three';
import { menu, type MenuItem } from '../data/menu';
import { Tweens, easeInOut, easeOut } from './tweens';
import { lerp } from './vox';
import {
  COUNTER,
  buildBowl,
  buildCat,
  buildChopsticks,
  buildExterior,
  buildInterior,
  buildMenuBoard,
  buildNoren,
  buildOwner,
  buildWalker,
} from './world';

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
  /** 주문한 메뉴를 조리해서 낸다. instant면 조리 없이 바로 놓는다 */
  serve(item: MenuItem, instant?: boolean): void;
  /** 그릇을 치우고 차림표로 돌아간다 */
  backToMenu(): void;
  /** 가게 밖으로 나간다 */
  leave(): void;
  /** 지금까지 맛본 메뉴. 카운터 한쪽에 작은 그릇으로 놓는다 */
  setTasted(slugs: readonly string[]): void;
  /** 진행 중인 연출을 빨리 감는다 */
  hurry(): void;
  dispose(): void;
}

const LIFTED = -1.45; // 걷어 올린 노렌의 각도
const SLOT_SCALE = 0.25;
const SERVE_SPOT = new THREE.Vector3(0, COUNTER.top, -4.75);
const POT = new THREE.Vector3(2.0, 2.25, -9.1);

interface View {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  /** 화면을 왼쪽으로 미는 정도(오른쪽에 패널이 놓일 때) */
  shift: number;
  /** 화면을 위로 올리는 정도(아래에 패널이 놓일 때) */
  rise: number;
}

/** 다 본 그릇이 놓일 자리. 차림표 순서대로 카운터 안쪽에 줄지어 놓는다 */
export function slotOf(index: number): [number, number, number] {
  return [-1.4 + index * 0.28, COUNTER.top, -4.98];
}

export async function createStage(opts: StageOptions): Promise<Stage> {
  const { canvas, reduceMotion } = opts;
  const T = (seconds: number) => (reduceMotion ? 0 : seconds);

  // WebGL을 못 쓰면 여기서 예외가 나고, 부른 쪽이 장면 없는 화면으로 넘어간다
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0c1020');
  scene.fog = new THREE.Fog('#0c1020', 34, 80);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  const tweens = new Tweens();

  scene.add(new THREE.HemisphereLight('#8a98cc', '#1c1c26', 1.1));
  const moon = new THREE.DirectionalLight('#9fb2e6', 0.9);
  moon.position.set(-6, 10, 12);
  scene.add(moon);
  const lamps: Array<[string, number, number, number, number, number]> = [
    ['#ff9a55', 14, 9, -2, 2.9, 1.6], // 초롱
    ['#ff9a55', 14, 9, 2, 2.9, 1.6],
    ['#ffd9a0', 20, 16, 0, 3.0, -4.4], // 카운터 위 등
    ['#ffd9a0', 12, 12, -3, 3.0, -7.5],
    ['#ffd9a0', 12, 12, 3, 3.0, -7.5],
    ['#ffcf90', 12, 9, 0, 3.2, -1.4],
  ];
  const lights = lamps.map(([color, intensity, distance, x, y, z]) => {
    const light = new THREE.PointLight(color, intensity, distance, 1.6);
    light.position.set(x, y, z);
    scene.add(light);
    return light;
  });
  const lanternLights = lights.slice(0, 2);

  // 간판과 노렌의 글자를 픽셀 글꼴로 그리려면 글꼴이 먼저 와 있어야 한다
  await document.fonts.load('12px Galmuri11', '국수집한상면〇').catch(() => undefined);

  scene.add(buildExterior(), buildInterior());
  const noren = buildNoren();
  noren.forEach((strip) => scene.add(strip));
  const owner = buildOwner();
  owner.root.position.set(0, 0, -6.4);
  scene.add(owner.root);
  const menuBoard = buildMenuBoard();
  menuBoard.rotation.x = -0.5;
  menuBoard.visible = false;
  scene.add(menuBoard);
  const chopsticks = buildChopsticks();
  chopsticks.position.set(0.85, COUNTER.top, -4.7);
  chopsticks.visible = false;
  scene.add(chopsticks);

  // 가게 앞 — 의자 위의 고양이, 가끔 지나가는 사람, 내리는 눈
  const cat = buildCat();
  cat.root.position.set(3.95, 0.67, 1.05);
  cat.root.rotation.y = -0.35;
  scene.add(cat.root);
  let catHop = 0;
  const walker = buildWalker();
  walker.root.position.set(-40, 0, 4.2);
  scene.add(walker.root);
  let walkAt = 6; // 다음에 지나가기 시작할 시각(초)
  const FLAKES = reduceMotion ? 0 : 160;
  const snow = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), new THREE.MeshBasicMaterial({ color: '#eef3fa' }), Math.max(1, FLAKES));
  snow.count = FLAKES;
  snow.frustumCulled = false;
  scene.add(snow);
  const flakes = Array.from({ length: FLAKES }, (_, i) => ({
    x: ((i * 7919) % 300) / 10 - 15,
    y: ((i * 104729) % 130) / 10,
    // 카메라 바로 앞의 눈송이는 화면을 가릴 만큼 크게 보이므로 가게 쪽에만 내리게 한다
    z: 0.6 + ((i * 1299709) % 80) / 10,
    speed: 0.7 + ((i * 31) % 10) / 14,
  }));
  const flakeMatrix = new THREE.Matrix4();

  // 김 — 솥에서 늘 조금씩 오르고, 조리할 때와 그릇이 나왔을 때 더 오른다
  const steamMat = new THREE.MeshBasicMaterial({ color: '#f4efe4', transparent: true, opacity: 0.5 });
  const steamGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  const steam = Array.from({ length: 18 }, (_, i) => {
    const puff = new THREE.Mesh(steamGeo, steamMat);
    puff.userData.t = i / 18;
    scene.add(puff);
    return puff;
  });
  let steamBoost = 0;
  let bowlSteam: THREE.Vector3 | null = null;

  // ── 상태 ──
  let phase: Phase = 'outside';
  const setPhase = (next: Phase) => {
    phase = next;
    opts.onPhase(next);
  };
  const say = opts.onSay;
  const bowls = new Map<string, THREE.Group>();
  let tasted: readonly string[] = [];
  /** 지금 손님 앞에 놓인 그릇 */
  let current: string | null = null;
  const pose = { bow: 0, armR: 0, armL: 0, hold: 0, turn: 0, x: 0, wave: 0, busy: 0 };
  const set = (key: keyof typeof pose, to: number, seconds: number, ease = easeOut) => {
    const from = pose[key];
    return tweens.run(T(seconds), (k) => (pose[key] = lerp(from, to, k)), ease);
  };

  // ── 카메라 ──
  /** 패널을 옆에 놓는 화면인지. 폭이 좁고 세로로 긴 화면에서는 패널이 아래에 놓인다(CSS와 같은 기준) */
  const wide = () => window.innerWidth >= 900 || window.innerWidth > window.innerHeight;
  const outsideView = (): View => {
    const aspect = window.innerWidth / window.innerHeight;
    // 세로로 긴 화면에서는 처마 끝이 조금 잘리더라도 가게가 크게 보이게 다가간다
    const halfWidth = aspect < 1 ? 5.3 : 6.6;
    const dist = Math.max(12.5, halfWidth / (Math.tan((camera.fov * Math.PI) / 360) * aspect));
    return { pos: new THREE.Vector3(0, 2.7, dist), look: new THREE.Vector3(0, 2.6, 0), shift: 0, rise: 0 };
  };
  // 좁은 화면에서는 아래쪽을 차림표(58%)나 소개(70%)가 덮으므로, 장면을 그만큼 위로 올려 남은 자리 가운데에 둔다
  const insideView = (withPanel: boolean): View => ({
    pos: new THREE.Vector3(0, 2.55, wide() ? -0.6 : 0.6),
    look: new THREE.Vector3(0, 2.2, -6.4),
    shift: withPanel && wide() ? 0.2 : 0,
    rise: withPanel && !wide() ? 0.15 : 0,
  });
  const servedView = (): View =>
    wide()
      ? { pos: new THREE.Vector3(0, 2.7, -1.8), look: new THREE.Vector3(0, 2.0, -5.2), shift: 0.25, rise: 0 }
      : { pos: new THREE.Vector3(0, 2.6, -0.9), look: new THREE.Vector3(0, 1.75, -5.0), shift: 0, rise: 0.33 };
  const viewOf = (p: Phase): View | null =>
    p === 'outside' ? outsideView() : p === 'menu' ? insideView(true) : p === 'served' ? servedView() : null;

  const cam: View = outsideView();
  const snapCamera = (to: View) => {
    cam.pos.copy(to.pos);
    cam.look.copy(to.look);
    cam.shift = to.shift;
    cam.rise = to.rise;
  };
  const moveCamera = (to: View, seconds: number) => {
    const from = { pos: cam.pos.clone(), look: cam.look.clone(), shift: cam.shift, rise: cam.rise };
    return tweens.run(
      T(seconds),
      (k) => {
        cam.pos.lerpVectors(from.pos, to.pos, k);
        cam.look.lerpVectors(from.look, to.look, k);
        cam.shift = lerp(from.shift, to.shift, k);
        cam.rise = lerp(from.rise, to.rise, k);
      },
      easeInOut,
    );
  };

  // ── 그릇 ──
  const bowlOf = (slug: string): THREE.Group | undefined => {
    let bowl = bowls.get(slug);
    if (bowl) return bowl;
    const item = menu.find((m) => m.slug === slug);
    if (!item) return undefined;
    bowl = buildBowl(item.bowl);
    bowls.set(slug, bowl);
    scene.add(bowl);
    return bowl;
  };
  const toSlot = (slug: string, bowl: THREE.Group) => {
    bowl.position.set(...slotOf(menu.findIndex((m) => m.slug === slug)));
    bowl.scale.setScalar(SLOT_SCALE);
    bowl.visible = true;
  };
  const layoutBowls = () => {
    for (const [slug, bowl] of bowls) {
      if (slug === current) continue;
      if (tasted.includes(slug)) toSlot(slug, bowl);
      else bowl.visible = false;
    }
    for (const slug of tasted) {
      if (slug === current || bowls.has(slug)) continue;
      const bowl = bowlOf(slug);
      if (bowl) toSlot(slug, bowl);
    }
  };

  // ── 명령은 한 번에 하나씩 차례로 한다. 밀린 명령이 있으면 앞의 연출을 빨리 감는다 ──
  let pending = 0;
  let hurried = false;
  let disposed = false;
  let chain: Promise<void> = Promise.resolve();
  const push = (run: () => Promise<void>) => {
    pending += 1;
    chain = chain
      .then(() => (disposed ? undefined : run()))
      .catch((error: unknown) => console.error(error))
      .then(() => {
        pending -= 1;
        hurried = false;
      });
  };

  const liftNoren = () => noren.forEach((strip) => (strip.rotation.x = LIFTED));

  /** 연출 없이 가게 안 차림표 앞에 선다 */
  const standInside = () => {
    liftNoren();
    snapCamera(insideView(true));
    setPhase('menu');
  };

  async function runEnter() {
    if (phase !== 'outside') return;
    setPhase('entering');
    canvas.style.cursor = '';
    // 노렌이 가운데부터 걷힌다
    noren.forEach((strip, i) => {
      const from = strip.rotation.x;
      void tweens
        .wait(T(Math.abs(i - 1.5) * 0.08))
        .then(() => tweens.run(T(0.6), (k) => (strip.rotation.x = lerp(from, LIFTED, k))));
    });
    await tweens.wait(T(0.25));
    await moveCamera(insideView(false), 1.9);

    setPhase('greeting');
    say('어서 오세요!');
    await set('bow', 0.42, 0.3);
    await tweens.wait(T(0.35));
    await set('bow', 0, 0.3);
    void set('armR', 2.5, 0.25);
    await set('wave', 1, 0.2);
    await tweens.wait(T(0.7));
    void set('wave', 0, 0.2);
    await set('armR', 0, 0.3);

    // 차림표를 카운터 위로 올려 준다
    say('차림표 여기 있어요.');
    menuBoard.visible = true;
    void set('hold', 0.8, 0.3);
    await tweens.run(T(0.45), (k) => menuBoard.position.set(0, lerp(COUNTER.top - 0.8, COUNTER.top + 0.5, k), lerp(-4.9, -4.55, k)));
    await tweens.wait(T(0.35));
    void set('hold', 0, 0.3);
    menuBoard.visible = false;

    setPhase('menu');
    say('천천히 고르세요.');
    await moveCamera(insideView(true), 0.7);
  }

  async function runSkip() {
    if (phase !== 'outside') return;
    standInside();
    say('어서 오세요!\n천천히 고르세요.');
  }

  /** 손님 앞의 그릇을 카운터 한쪽으로 물린다 */
  function putAway(seconds: number) {
    if (!current) return Promise.resolve();
    const slug = current;
    const bowl = bowls.get(slug)!;
    current = null;
    chopsticks.visible = false;
    bowlSteam = null;
    const from = bowl.position.clone();
    const to = new THREE.Vector3(...slotOf(menu.findIndex((m) => m.slug === slug)));
    return tweens.run(
      T(seconds),
      (k) => {
        bowl.position.lerpVectors(from, to, k);
        bowl.scale.setScalar(lerp(1, SLOT_SCALE, k));
      },
      easeInOut,
    );
  }

  function place(item: MenuItem) {
    const bowl = bowlOf(item.slug)!;
    current = item.slug;
    bowl.visible = true;
    bowl.scale.setScalar(1);
    bowl.position.copy(SERVE_SPOT);
    chopsticks.visible = true;
    bowlSteam = SERVE_SPOT.clone().setY(COUNTER.top + 0.55);
    return bowl;
  }

  async function runServe(item: MenuItem, instant: boolean) {
    if (phase === 'served' && current === item.slug) return;
    if (phase === 'outside') liftNoren();

    if (instant || reduceMotion) {
      void putAway(0);
      place(item);
      layoutBowls();
      snapCamera(servedView());
      say(null);
      setPhase('served');
      return;
    }

    const fromOutside = phase === 'outside';
    setPhase('cooking');
    if (fromOutside) snapCamera(insideView(false));
    else void moveCamera(insideView(false), 0.6);
    void putAway(0.5);
    say('잠시만요!');

    // 돌아서서 솥 앞으로 간다
    void set('x', 1.3, 0.45, easeInOut);
    await set('turn', Math.PI, 0.45, easeInOut);
    steamBoost = 1;
    void set('hold', 0.9, 0.2);
    await set('busy', 1, 0.15);
    await tweens.wait(1.1);
    await set('busy', 0, 0.15);
    steamBoost = 0;

    void set('x', 0, 0.45, easeInOut);
    await set('turn', 0, 0.45, easeInOut);
    say(`${item.name} 나왔어요!`);
    const bowl = place(item);
    chopsticks.visible = false;
    const from = new THREE.Vector3(0, 1.85, -5.75);
    await tweens.run(0.5, (k) => {
      bowl.position.lerpVectors(from, SERVE_SPOT, k);
      bowl.position.y += Math.sin(k * Math.PI) * 0.25;
    });
    chopsticks.visible = true;
    void set('hold', 0, 0.3);

    setPhase('served');
    await moveCamera(servedView(), 0.8);
    say(null);
  }

  async function runBack() {
    if (phase !== 'served') return;
    setPhase('menu');
    say('더 드시겠어요?');
    void putAway(0.6);
    await moveCamera(insideView(true), 0.7);
  }

  async function runLeave() {
    if (phase !== 'menu') return;
    setPhase('entering');
    say('또 오세요!');
    void set('bow', 0.42, 0.3).then(() => set('bow', 0, 0.4));
    await moveCamera(outsideView(), 1.6);
    await tweens.run(T(0.5), (k) => noren.forEach((strip) => (strip.rotation.x = lerp(LIFTED, 0, k))));
    say(null);
    setPhase('outside');
  }

  // ── 입력 ──
  const pointer = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const doorHit = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ visible: false }));
  doorHit.position.set(0, 1.6, 0.2);
  scene.add(doorHit);
  let overDoor = false;
  const hitsDoor = (event: MouseEvent) => {
    const ndc = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(doorHit).length > 0;
  };
  const hitsCat = () => raycaster.intersectObject(cat.root, true).length > 0;
  const onPointerMove = (event: PointerEvent) => {
    // 손가락으로 누를 때마다 화면이 튀지 않게, 카메라는 마우스만 따라간다
    if (event.pointerType === 'mouse') {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    }
    if (phase !== 'outside') return;
    overDoor = hitsDoor(event);
    canvas.style.cursor = overDoor || hitsCat() ? 'pointer' : '';
  };
  const onClick = (event: MouseEvent) => {
    if (phase === 'outside' && hitsDoor(event)) push(runEnter);
    else if (phase === 'outside' && hitsCat()) {
      // 고양이를 누르면 폴짝 뛴다
      opts.onCat();
      if (!reduceMotion) void tweens.run(0.4, (k) => (catHop = Math.sin(k * Math.PI) * 0.3));
    } else if (phase === 'entering' || phase === 'greeting' || phase === 'cooking') hurried = true;
  };
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // 화면을 작게 그린 뒤 늘려서 픽셀이 보이게 한다
    const px = Math.min(w, h) >= 600 ? 3 : 2;
    renderer.setPixelRatio(1);
    renderer.setSize(Math.ceil(w / px), Math.ceil(h / px), false);
    camera.aspect = w / h;
    const view = pending === 0 ? viewOf(phase) : null;
    if (view) snapCamera(view);
  };
  window.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);
  onResize();

  // ── 그리기 ──
  let last = performance.now();
  let time = 0;
  let sway = 0;
  let raf = 0;

  function tick(dt: number) {
    time += dt;
    tweens.scale = hurried || pending > 1 ? 8 : 1;
    tweens.step(dt);

    // 주인장 — 숨 쉬듯 조금 움직이고, 자세 값에 따라 숙이고 흔들고 든다
    owner.root.position.x = pose.x;
    owner.root.rotation.y = pose.turn;
    owner.torso.rotation.x = pose.bow;
    owner.torso.position.y = 1.0 + Math.sin(time * 2.2) * 0.012 + Math.abs(Math.sin(time * 14)) * 0.05 * pose.busy;
    owner.head.rotation.z = Math.sin(time * 1.3) * 0.03;
    const chop = Math.sin(time * 14) * 0.35 * pose.busy;
    owner.armR.rotation.set(-1.25 * pose.hold + chop, 0, pose.armR + Math.sin(time * 11) * 0.28 * pose.wave);
    owner.armL.rotation.set(-1.25 * pose.hold - chop, 0, -pose.armL);

    // 노렌 — 바람에 조금 흔들리고, 가리키면 더 흔들린다
    if (phase === 'outside' && !reduceMotion) {
      sway = lerp(sway, overDoor ? 1 : 0, 0.08);
      noren.forEach((strip, i) => {
        strip.rotation.x = Math.sin(time * 1.6 + i * 0.9) * (0.05 + sway * 0.16) - sway * 0.12;
      });
    }

    // 주인장이 가끔 눈을 깜빡인다
    owner.lids.visible = !reduceMotion && time % 4.2 < 0.13;

    // 가게 앞은 밖에 있을 때만 움직인다
    if (cam.pos.z > 0 && !reduceMotion) {
      lanternLights.forEach((light, i) => {
        light.intensity = 14 * (1 + Math.sin(time * 9 + i * 2) * 0.07 + Math.sin(time * 23 + i) * 0.05);
      });
      cat.tail.rotation.y = Math.sin(time * 1.8) * 0.5;
      cat.head.rotation.z = Math.sin(time * 0.7) * 0.08;
      cat.root.position.y = 0.67 + catHop;

      // 행인은 가끔 왼쪽에서 오른쪽으로 지나간다
      if (time > walkAt) {
        const x = -17 + (time - walkAt) * 1.7;
        const swing = Math.sin(time * 6.5) * 0.55;
        walker.root.position.set(x, Math.abs(Math.sin(time * 6.5)) * 0.05, 4.2);
        walker.legL.rotation.z = swing;
        walker.legR.rotation.z = -swing;
        if (x > 17) walkAt = time + 14;
      }

      flakes.forEach((flake, i) => {
        flake.y -= flake.speed * dt;
        if (flake.y < 0) flake.y += 13;
        flakeMatrix.makeTranslation(flake.x + Math.sin(time * 0.8 + i) * 0.35, flake.y, flake.z);
        snow.setMatrixAt(i, flakeMatrix);
      });
      snow.instanceMatrix.needsUpdate = true;
    }

    steam.forEach((puff, i) => {
      const fromBowl = bowlSteam !== null && i % 3 === 0;
      const origin = fromBowl ? bowlSteam! : POT;
      const t = ((puff.userData.t as number) + dt * (fromBowl ? 0.5 : 0.35 + steamBoost * 0.5)) % 1;
      puff.userData.t = t;
      const spread = fromBowl ? 0.25 : 0.4 + steamBoost * 0.3;
      puff.position.set(
        origin.x + Math.sin(i * 2.4 + t * 3) * spread * t,
        origin.y + t * (fromBowl ? 0.8 : 1.4 + steamBoost * 0.6),
        origin.z + Math.cos(i * 1.7) * spread * 0.5,
      );
      puff.scale.setScalar(Math.max(0.01, (fromBowl ? 0.5 : 1) * (0.5 + t) * (1 - t) * 2.2));
      puff.visible = !reduceMotion && (fromBowl || i % 2 === 0 || steamBoost > 0);
    });

    // 카메라 — 포인터를 따라 살짝 움직여 깊이가 보이게 한다
    const drift = reduceMotion ? 0 : 1;
    // 가게 앞(타이틀)에서는 가만히 있어도 화면이 천천히 흘러간다
    const idle = phase === 'outside' ? Math.sin(time * 0.25) * 0.7 * drift : 0;
    camera.position.set(cam.pos.x + idle + pointer.x * 0.3 * drift, cam.pos.y - pointer.y * 0.15 * drift, cam.pos.z);
    camera.lookAt(cam.look);
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.setViewOffset(w, h, cam.shift * w, cam.rise * h, w, h);

    renderer.render(scene, camera);
  }

  const frame = () => {
    const now = performance.now();
    tick(Math.min((now - last) / 1000, 0.05));
    last = now;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    enter: () => push(runEnter),
    skipToMenu: () => push(runSkip),
    serve: (item, instant = false) => push(() => runServe(item, instant)),
    backToMenu: () => push(runBack),
    leave: () => push(runLeave),
    setTasted(slugs) {
      tasted = slugs;
      layoutBowls();
    },
    hurry() {
      hurried = true;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      tweens.clear();
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose();
          material.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
