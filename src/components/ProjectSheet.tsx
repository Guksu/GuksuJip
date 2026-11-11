import type { Ref } from 'react';
import { categories, type MenuItem } from '../data/menu';
import styles from './ProjectSheet.module.css';

interface ProjectSheetProps {
  item: MenuItem;
  prev: MenuItem;
  next: MenuItem;
  onMove: (slug: string) => void;
  /** 화면이 열리면 제목으로 포커스를 옮기기 위한 ref */
  titleRef: Ref<HTMLHeadingElement>;
  titleId: string;
}

function ArrowOut() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 16 16 8M9 8h7v7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 프로젝트 소개. 그릇 옆(좁은 화면에서는 아래)에 놓이는 종이 한 장. */
export function ProjectSheet({ item, prev, next, onMove, titleRef, titleId }: ProjectSheetProps) {
  const category = categories.find((c) => c.id === item.category);
  const [primary, ...others] = item.links;
  // 분류 이름에 종류가 이미 들어 있으면(AI 도구·스킬의 '스킬') 되풀이하지 않는다
  const categoryTitle = category?.title ?? '';
  const meta = categoryTitle.includes(item.kind) ? categoryTitle : `${categoryTitle} · ${item.kind}`;

  return (
    <article className={styles.sheet}>
      <header className={styles.head}>
        <p className={styles.meta}>{meta}</p>
        <h1 id={titleId} ref={titleRef} tabIndex={-1} className={styles.name}>
          {item.name}
        </h1>
        <p className={styles.tagline}>{item.tagline}</p>
      </header>

      {(item.links.length > 0 || item.privateRepo) && (
        <div className={styles.actions}>
          {primary && (
            <a className={styles.primary} href={primary.href} target="_blank" rel="noreferrer">
              {primary.label}
              <ArrowOut />
            </a>
          )}
          {others.map((link) => (
            <a key={link.href} className={styles.secondary} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowOut />
            </a>
          ))}
          {item.privateRepo && <p className={styles.note}>저장소는 비공개예요.</p>}
        </div>
      )}

      <p className={styles.intro}>{item.intro}</p>

      <section className={styles.section} aria-labelledby={`${titleId}-points`}>
        <h2 id={`${titleId}-points`} className={styles.sectionTitle}>
          맛 포인트
        </h2>
        <ul className={styles.points}>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby={`${titleId}-stack`}>
        <h2 id={`${titleId}-stack`} className={styles.sectionTitle}>
          재료
        </h2>
        <p className={styles.stack}>{item.stack.join(' · ')}</p>
      </section>

      <nav className={styles.others} aria-label="다른 메뉴">
        <button type="button" className={styles.move} onClick={() => onMove(prev.slug)}>
          <span className={styles.moveLabel}>이전 메뉴</span>
          <span className={styles.moveName}>{prev.name}</span>
        </button>
        <button type="button" className={`${styles.move} ${styles.moveNext}`} onClick={() => onMove(next.slug)}>
          <span className={styles.moveLabel}>다음 메뉴</span>
          <span className={styles.moveName}>{next.name}</span>
        </button>
      </nav>
    </article>
  );
}
