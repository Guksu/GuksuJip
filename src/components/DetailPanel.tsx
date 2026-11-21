import { useEffect, useRef } from 'react';
import { menu, type MenuItem } from '../data/menu';
import { ProjectSheet } from './ProjectSheet';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
  show: boolean;
  item: MenuItem;
  onClose: () => void;
  onMove: (slug: string) => void;
}

/** 음식이 나오면 그릇 옆에 펼쳐지는 프로젝트 소개. */
export function DetailPanel({ show, item, onClose, onMove }: DetailPanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const index = menu.indexOf(item);
  const prev = menu[(index - 1 + menu.length) % menu.length];
  const next = menu[(index + 1) % menu.length];

  // 소개가 펼쳐지면 제목으로 포커스를 옮긴다
  useEffect(() => {
    if (show) titleRef.current?.focus({ preventScroll: true });
  }, [show, item]);

  // Esc로 차림표로 돌아간다
  useEffect(() => {
    if (!show) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  return (
    <article className={styles.detail} data-show={show} inert={!show}>
      <div className={styles.bar}>
        <button type="button" className={styles.back} onClick={onClose}>
          <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
          차림표
        </button>
        <p className={styles.dish}>
          No. {String(index + 1).padStart(2, '0')} · {item.dish}
        </p>
      </div>
      <div key={item.slug} className={styles.body}>
        <ProjectSheet item={item} prev={prev} next={next} onMove={onMove} titleRef={titleRef} />
        <p className={styles.stack}>
          <span className={styles.stackLabel}>사용 기술</span> {item.stack.join(' · ')}
        </p>
      </div>
    </article>
  );
}
