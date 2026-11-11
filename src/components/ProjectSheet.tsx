import type { Ref } from 'react';
import { categories, type MenuItem } from '../data/menu';
import { LeadShots, MoreShots } from './Shots';
import styles from './ProjectSheet.module.css';

interface ProjectSheetProps {
  item: MenuItem;
  prev: MenuItem;
  next: MenuItem;
  onMove: (slug: string) => void;
  /** 화면이 열리면 제목으로 포커스를 옮기기 위한 ref */
  titleRef: Ref<HTMLHeadingElement>;
}

function ArrowOut() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 16 16 8M9 8h7v7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 프로젝트 소개. 그릇 옆(좁은 화면에서는 아래)에 놓이는 종이 한 장.
 *  종류·재료 같은 사실은 상 위의 주문서가 맡고, 여기서는 무엇을 만들었는지를 화면과 글로 보여 준다. */
export function ProjectSheet({ item, prev, next, onMove, titleRef }: ProjectSheetProps) {
  const category = categories.find((c) => c.id === item.category);
  const [primary, ...others] = item.links;

  return (
    <div className={styles.sheet}>
      <header className={styles.head}>
        <p className={styles.meta}>{category?.title}</p>
        <h1 ref={titleRef} tabIndex={-1} className={styles.name}>
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

      <LeadShots item={item} />

      <p className={styles.intro}>{item.intro}</p>

      <section className={styles.section} aria-labelledby="points-title">
        <h2 id="points-title" className={styles.sectionTitle}>
          주요 기능
        </h2>
        <ul className={styles.points}>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <MoreShots item={item} />

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
    </div>
  );
}
