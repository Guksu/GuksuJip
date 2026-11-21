import { useCallback, useEffect, useRef, useState } from 'react';
import type { MenuItem } from '../data/menu';
import type { Phase, Stage } from '../scene/stage';
import { CheckDialog } from './CheckDialog';
import { DetailPanel } from './DetailPanel';
import { MenuPanel } from './MenuPanel';
import styles from './Shop.module.css';

/** 말풍선 글을 한 글자씩 찍는다. 찍힌 글과 아직 안 찍힌 글을 나눠 돌려준다.
 *  안 찍힌 글도 자리를 차지하게 두면, 찍히는 동안 줄바꿈과 말풍선 크기가 바뀌지 않는다 */
function useTyped(line: string | null, instant: boolean): [string, string] {
  const [count, setCount] = useState(0);
  const chars = line ? [...line] : [];
  const total = chars.length;

  useEffect(() => {
    if (instant || total === 0) return;
    setCount(0);
    const timer = window.setInterval(() => setCount((n) => (n >= total ? n : n + 1)), 28);
    return () => window.clearInterval(timer);
  }, [line, instant, total]);

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
  const bubbleRef = useRef<HTMLParagraphElement>(null);
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

  const phase: Phase = failed ? (item ? 'served' : 'menu') : scenePhase;
  const [typed, rest] = useTyped(line, reduceMotion);

  // 장면은 three.js가 커서 따로 내려받는다
  useEffect(() => {
    let live = true;
    let created: Stage | null = null;
    import('../scene/stage')
      .then(({ createStage }) =>
        createStage({
          canvas: canvasRef.current!,
          bubble: bubbleRef.current!,
          reduceMotion,
          onPhase: (next) => live && setScenePhase(next),
          onSay: (next) => live && setLine(next),
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
  }, [reduceMotion]);

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

  const point = useCallback((target: MenuItem) => setLine(`${target.dish}!\n${target.tagline}`), []);
  const busy = phase === 'entering' || phase === 'greeting' || phase === 'cooking';
  const shown = item ?? lastItem.current;

  return (
    <main className={styles.shop}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {phase !== 'served' && <h1 className="sr-only">국수집, 김종민의 프로젝트 차림표</h1>}

      {phase === 'outside' && (stage || failed) && (
        <div className={styles.outside}>
          <p className={styles.hint}>문을 눌러 가게로 들어가세요</p>
          <div className={styles.outsideActions}>
            <button type="button" className={styles.enter} onClick={() => stage?.enter()}>
              들어가기
            </button>
            <button type="button" className={styles.ghost} onClick={() => stage?.skipToMenu()}>
              차림표 바로 보기
            </button>
          </div>
        </div>
      )}

      {/* 말풍선은 한 글자씩 찍히므로 읽어 주는 글은 따로 한 번에 둔다 */}
      <p ref={bubbleRef} className={styles.bubble} aria-hidden="true" hidden={!line || failed || phase === 'outside'}>
        {typed}
        <span className={styles.rest}>{rest}</span>
      </p>
      <p className="sr-only" role="status">
        {phase === 'outside' ? '' : line?.replace('\n', ' ')}
      </p>

      {busy && !reduceMotion && (
        <button type="button" className={styles.skip} onClick={() => stage?.hurry()}>
          건너뛰기
        </button>
      )}

      <MenuPanel
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
