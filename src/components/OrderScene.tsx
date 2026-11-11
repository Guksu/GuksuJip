import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MenuItem } from '../data/menu';
import { Bowl } from './Bowl';
import { ProjectSheet } from './ProjectSheet';
import styles from './OrderScene.module.css';

/** 장면을 어디서부터 보여 줄지.
 *  full: 차림표에서 주문 — 주문서부터. serve: 이전·다음 메뉴 — 그릇이 나오는 것부터.
 *  none: 주소로 바로 들어옴 — 움직임 없이 소개부터. */
export type Intro = 'full' | 'serve' | 'none';

type Phase = 'ticket' | 'serving' | 'served';

const TICKET_MS = 900;
const SERVING_MS = 650;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface OrderSceneProps {
  item: MenuItem;
  /** 차림표에서 몇 번째 메뉴인지(주문서 번호) */
  number: number;
  intro: Intro;
  prev: MenuItem;
  next: MenuItem;
  onClose: () => void;
  onMove: (slug: string) => void;
}

/** 주문서가 주방으로 넘어가고 → 그릇이 상에 놓이고 → 소개가 펼쳐지는 장면. */
export function OrderScene({ item, number, intro, prev, next, onClose, onMove }: OrderSceneProps) {
  const reduceMotion = useReducedMotion();
  const start: Phase = reduceMotion || intro === 'none' ? 'served' : intro === 'serve' ? 'serving' : 'ticket';
  const [phase, setPhase] = useState<Phase>(start);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const animated = start !== 'served';

  // 단계를 시간에 맞춰 넘긴다
  useEffect(() => {
    if (phase === 'served') return;
    const timer = window.setTimeout(
      () => setPhase(phase === 'ticket' ? 'serving' : 'served'),
      phase === 'ticket' ? TICKET_MS : SERVING_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  // 소개가 펼쳐지면 제목으로 포커스를 옮긴다
  useEffect(() => {
    if (phase === 'served') titleRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // Esc로 차림표로 돌아간다. 뒤의 차림표는 스크롤되지 않게 잠근다
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.setAttribute('data-scene-open', '');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.removeAttribute('data-scene-open');
    };
  }, [onClose]);

  const served = phase === 'served';
  const skip = () => {
    if (!served) setPhase('served');
  };

  return (
    <motion.div
      className={styles.scene}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      onPointerDown={skip}
    >
      {/* 머리 줄과 소개 종이는 그릇이 놓인 뒤 상 위로 함께 올라온다 */}
      <motion.div
        className={styles.bar}
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: served ? 1 : 0 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        inert={!served}
      >
        <button type="button" className={styles.back} onClick={onClose}>
          <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          차림표
        </button>
      </motion.div>

      {/* 상 — 그릇이 놓이는 자리 */}
      <div className={styles.table}>
        <motion.div
          className={styles.serving}
          initial={animated ? { x: '60%', rotate: 28, opacity: 0 } : false}
          animate={phase === 'ticket' ? { x: '60%', rotate: 28, opacity: 0 } : { x: 0, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 19, mass: 0.9 }}
        >
          <span className={styles.chopsticks} aria-hidden="true" />
          <Bowl spec={item.bowl} label={`${item.dish} 한 그릇`} className={styles.bowl} />
          {served && animated && (
            <svg className={styles.steam} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <path d="M30 100c-14-18 14-30 0-50s10-26 4-40" />
              <path d="M60 106c-14-20 14-32 0-54s10-28 2-44" />
              <path d="M90 100c-14-18 14-30 0-50s10-26 4-40" />
            </svg>
          )}
        </motion.div>
        <motion.p
          className={styles.dish}
          initial={animated ? { opacity: 0 } : false}
          animate={{ opacity: served ? 1 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          오늘의 그릇 · {item.dish}
        </motion.p>
      </div>

      {/* 소개 */}
      <motion.div
        className={styles.paper}
        initial={animated ? { opacity: 0, y: 24 } : false}
        animate={served ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        inert={!served}
      >
        <ProjectSheet item={item} prev={prev} next={next} onMove={onMove} titleRef={titleRef} titleId={titleId} />
      </motion.div>

      {/* 주문서 — 도장이 찍히고 주방(위쪽)으로 넘어간다 */}
      <AnimatePresence>
        {phase === 'ticket' && (
          <motion.div
            key="ticket"
            className={styles.ticketLayer}
            aria-hidden="true"
            initial={{ y: 40, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: -2 }}
            exit={{ y: '-70vh', opacity: 0, rotate: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <div className={styles.ticket}>
              <p className={styles.ticketTitle}>주문서</p>
              <p className={styles.ticketNo}>No. {String(number).padStart(2, '0')}</p>
              <p className={styles.ticketItem}>
                <span>{item.name}</span>
                <span>한 그릇</span>
              </p>
              <p className={styles.ticketNote}>주방으로 넘길게요</p>
              <motion.span
                className={styles.ticketStamp}
                initial={{ scale: 1.8, opacity: 0, rotate: -14 }}
                animate={{ scale: 1, opacity: 1, rotate: -14 }}
                transition={{ delay: 0.32, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              >
                접수
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 스크린 리더에는 움직임 대신 한 줄로 알린다 */}
      <p className={styles.srOnly} role="status">
        {served ? `${item.name} 나왔어요.` : `${item.name} 주문이 들어갔어요.`}
      </p>
    </motion.div>
  );
}
