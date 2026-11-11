import { useEffect, useLayoutEffect, useRef } from 'react';
import { menu, type MenuItem } from '../data/menu';
import { Bowl } from './Bowl';
import { ProjectSheet } from './ProjectSheet';
import styles from './ProjectDetail.module.css';

interface ProjectDetailProps {
  item: MenuItem;
  onClose: () => void;
  onMove: (slug: string) => void;
}

/** 주문한 메뉴의 화면. 상 위에 그릇과 주문서가 놓이고, 옆에 소개 종이가 펼쳐진다. */
export function ProjectDetail({ item, onClose, onMove }: ProjectDetailProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const index = menu.indexOf(item);
  const prev = menu[(index - 1 + menu.length) % menu.length];
  const next = menu[(index + 1) % menu.length];

  // 새 화면은 맨 위에서 시작하고, 제목으로 포커스를 옮긴다
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc로 차림표로 돌아간다
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <main className={styles.detail}>
      {/* 상 — 그릇이 놓이는 자리 */}
      <div className={styles.table}>
        <div className={styles.bigBowl} style={{ viewTransitionName: 'bowl' }}>
          <Bowl spec={item.bowl} label={`${item.dish} 한 그릇`} className={styles.bowl} />
        </div>
        <span className={styles.chopsticks} aria-hidden="true" />
      </div>

      {/* 상 위에 놓인 주문서 — 종류·재료 같은 사실을 적는다 */}
      <aside className={styles.billArea} aria-labelledby="bill-title">
        <div className={styles.bill}>
          <h2 id="bill-title" className={styles.billTitle}>
            주문서
          </h2>
          <p className={styles.billNo}>No. {String(index + 1).padStart(2, '0')}</p>
          <dl className={styles.billList}>
            <dt>메뉴</dt>
            <dd>{item.name}</dd>
            <dt>그릇</dt>
            <dd>{item.dish}</dd>
            <dt>종류</dt>
            <dd>{item.kind}</dd>
            <dt>기술</dt>
            <dd>{item.stack.join(', ')}</dd>
          </dl>
          <span className={styles.stamp} aria-hidden="true">
            접수
          </span>
        </div>
      </aside>

      <article className={styles.paper}>
        <div className={styles.bar}>
          <button type="button" className={styles.back} onClick={onClose}>
            <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            차림표
          </button>
        </div>
        <ProjectSheet item={item} prev={prev} next={next} onMove={onMove} titleRef={titleRef} />
      </article>

      {/* 화면 전환은 눈으로만 보이므로, 무엇이 나왔는지 한 줄로 읽어 준다 */}
      <p className="sr-only" role="status">
        {item.name} 프로젝트 소개가 열렸어요.
      </p>
    </main>
  );
}
