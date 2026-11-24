import { useCallback, useEffect, useRef, useState } from 'react';
import { menu, type MenuItem } from '../data/menu';
import { Sound } from '../lib/sound';
import type { Phase, Stage } from '../pixel/stage';
import { CheckDialog } from './CheckDialog';
import { DetailPanel } from './DetailPanel';
import { Hud } from './Hud';
import { Dialogue } from './Dialogue';
import { MenuBoard } from './MenuBoard';
import { TitleScreen } from './TitleScreen';
import styles from './Shop.module.css';

/** 말풍선 글을 한 글자씩 찍는다. 찍힌 글과 아직 안 찍힌 글을 나눠 돌려준다.
 *  안 찍힌 글도 자리를 차지하게 두면, 찍히는 동안 줄바꿈과 말풍선 크기가 바뀌지 않는다 */
function useTyped(line: string | null, instant: boolean, onChar: () => void): [string, string] {
  const [count, setCount] = useState(0);
  const chars = line ? [...line] : [];
  const total = chars.length;

  useEffect(() => {
    if (instant || total === 0) return;
    setCount(0);
    let typed = 0;
    const timer = window.setInterval(() => {
      if (typed >= total) return;
      typed += 1;
      setCount(typed);
      // 두 글자에 한 번 말소리를 낸다
      if (typed % 2 === 1) onChar();
    }, 28);
    return () => window.clearInterval(timer);
  }, [line, instant, total, onChar]);

  if (instant) return [line ?? '', ''];
  return [chars.slice(0, count).join(''), chars.slice(count).join('')];
}

interface ShopProps {
  /** 지금 주문한(주소에 적힌) 메뉴 */
  item: MenuItem | undefined;
  ordered: string[];
  onOrder: (slug: string) => void;
  onClose: () => void;
  onClear: () => void;
}

/** 가게 한 채. 3D 장면 위에 안내·말풍선·차림표·소개를 얹고, 주문에 맞춰 장면을 움직인다. */
export function Shop({ item, ordered, onOrder, onClose, onClear }: ShopProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  /** 장면을 못 띄운 경우(WebGL을 못 쓰는 브라우저). 차림표와 소개만으로 동작한다 */
  const [failed, setFailed] = useState(false);
  const [scenePhase, setScenePhase] = useState<Phase>('outside');
  const [line, setLine] = useState<string | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const started = useRef(false);
  const lastItem = useRef(item);
  if (item) lastItem.current = item;

  const [sound] = useState(() => new Sound());
  const [soundOn, setSoundOn] = useState(false);
  const talk = useCallback(() => sound.play('talk'), [sound]);

  const phase: Phase = failed ? (item ? 'served' : 'menu') : scenePhase;
  const [typed, rest] = useTyped(line, reduceMotion, talk);

  useEffect(() => () => sound.dispose(), [sound]);

  // 장면이 넘어갈 때마다 그에 맞는 소리를 낸다
  const prevPhase = useRef(phase);
  useEffect(() => {
    const prev = prevPhase.current;
    prevPhase.current = phase;
    if (phase === prev) return;
    if (phase === 'entering' && prev === 'outside') sound.play('door');
    if (phase === 'cooking') sound.play('select');
    if (phase === 'served') sound.play('serve');
    if (phase === 'menu' && prev === 'served') sound.play('back');
    sound.setBoiling(phase === 'cooking');
  }, [phase, sound]);

  const toggleSound = useCallback(() => {
    const next = !sound.enabled;
    sound.setEnabled(next);
    setSoundOn(next);
    if (next) sound.play('select');
  }, [sound]);

  // 장면은 three.js가 커서 따로 내려받는다
  useEffect(() => {
    let live = true;
    let created: Stage | null = null;
    import('../pixel/stage')
      .then(({ createStage }) =>
        createStage({
          canvas: canvasRef.current!,
          reduceMotion,
          onPhase: (next) => live && setScenePhase(next),
          onSay: (next) => live && setLine(next),
          onCat: () => sound.play('meow'),
        }),
      )
      .then((made) => {
        if (!live) {
          made.dispose();
          return;
        }
        created = made;
        setStage(made);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
      started.current = false;
      created?.dispose();
      setStage(null);
    };
  }, [reduceMotion, sound]);

  // 주소(주문)가 바뀌면 장면을 그에 맞춘다
  useEffect(() => {
    if (!stage) return;
    if (!started.current) {
      // 처음 — 메뉴 주소로 바로 들어왔으면 음식부터 보여 주고, 아니면 가게 앞에서 시작한다
      started.current = true;
      if (item) stage.serve(item, true);
      return;
    }
    if (item) stage.serve(item);
    else stage.backToMenu();
  }, [stage, item]);

  useEffect(() => {
    stage?.setTasted(ordered);
  }, [stage, ordered]);

  const point = useCallback(
    (target: MenuItem) => {
      setLine(`${target.dish}, ${target.name}.\n${target.tagline}`);
      sound.play('tick');
    },
    [sound],
  );
  // 새로 맛본 국수는 잠깐 알림으로 띄운다
  const [toast, setToast] = useState<{ dish: string; name: string } | null>(null);
  const tastedCount = useRef(ordered.length);
  useEffect(() => {
    const grew = ordered.length > tastedCount.current;
    tastedCount.current = ordered.length;
    const latest = menu.find((entry) => entry.slug === ordered[ordered.length - 1]);
    if (!grew || !latest) return;
    setToast({ dish: latest.dish, name: latest.name });
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [ordered]);

  // 지금 할 일. 장면이 넘어갈 때마다 바뀐다
  const left = menu.length - ordered.length;
  const objective =
    phase === 'entering' || phase === 'greeting'
      ? '주인장 인사 듣기'
      : phase === 'cooking'
        ? '국수 기다리기'
        : phase === 'served'
          ? '소개 읽기'
          : ordered.length === 0
            ? '오늘의 차림에서 국수 주문하기'
            : left > 0
              ? `남은 국수 ${left}그릇`
              : '계산서 받기';

  const busy = phase === 'entering' || phase === 'greeting' || phase === 'cooking';
  const shown = item ?? lastItem.current;

  return (
    <main className={styles.shop}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {phase === 'outside' && (stage || failed) && (
        <TitleScreen
          soundOn={soundOn}
          onStart={() => stage?.enter()}
          onSkip={() => stage?.skipToMenu()}
          onToggleSound={toggleSound}
          onMove={() => sound.play('tick')}
        />
      )}
      {phase !== 'outside' && phase !== 'served' && <h1 className="sr-only">국수집, 김종민의 프로젝트 차림표</h1>}
      {phase !== 'outside' && <Hud ordered={ordered} objective={objective} toast={toast} soundOn={soundOn} onToggleSound={toggleSound} />}

      {/* 대화창은 한 글자씩 찍히므로 읽어 주는 글은 따로 한 번에 둔다 */}
      <Dialogue show={line !== null && !failed && phase !== 'outside' && phase !== 'served'} typed={typed} rest={rest} />
      <p className="sr-only" role="status">
        {phase === 'outside' ? '' : line?.replace('\n', ' ')}
      </p>

      {busy && !reduceMotion && (
        <button type="button" className={styles.skip} onClick={() => stage?.hurry()}>
          건너뛰기
        </button>
      )}

      <MenuBoard
        show={phase === 'menu'}
        ordered={ordered}
        last={lastItem.current?.slug ?? null}
        onPoint={point}
        onOrder={onOrder}
        onShowCheck={() => setCheckOpen(true)}
        onLeave={() => stage?.leave()}
      />
      {shown && <DetailPanel show={phase === 'served' && item !== undefined} item={shown} onClose={onClose} onMove={onOrder} />}

      <CheckDialog open={checkOpen} ordered={ordered} onClose={() => setCheckOpen(false)} onClear={onClear} />
    </main>
  );
}
