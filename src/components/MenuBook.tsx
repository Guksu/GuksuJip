import { useEffect, useRef } from 'react';
import { categories, menuByCategory } from '../data/menu';
import { owner } from '../data/owner';
import styles from './MenuBook.module.css';

interface MenuBookProps {
  open: boolean;
  /** 이미 주문한(소개를 본) 메뉴 */
  ordered: string[];
  /** 지금 가리키고 있는 메뉴 */
  active: string | null;
  onOpen: () => void;
  onHover: (slug: string | null) => void;
  onOrder: (slug: string) => void;
}

/** 상 위에 놓인 차림표 한 권. 덮여 있을 때는 표지만 보이고,
 *  펼치면 표지가 왼쪽으로 넘어가 안쪽 면(인사말)과 차림표가 나란히 놓인다. */
export function MenuBook({ open, ordered, active, onOpen, onHover, onOrder }: MenuBookProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const wasOpen = useRef(open);

  // 방금 펼쳤다면 차림표 제목으로 포커스를 옮긴다
  useEffect(() => {
    if (open && !wasOpen.current) titleRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  return (
    <div className={styles.book} data-open={open}>
      <section className={`${styles.leaf} ${styles.menuPage}`} aria-labelledby="menu-title" inert={!open}>
        <h2 id="menu-title" ref={titleRef} tabIndex={-1} className={styles.pageTitle}>
          차림표
        </h2>
        {categories.map((category) => (
          <div key={category.id} className={styles.group}>
            <h3 className={styles.groupTitle}>{category.title}</h3>
            <ul>
              {menuByCategory(category.id).map((item) => {
                const tasted = ordered.includes(item.slug);
                return (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className={styles.row}
                      data-slug={item.slug}
                      aria-current={active === item.slug ? 'true' : undefined}
                      onPointerEnter={() => onHover(item.slug)}
                      onPointerLeave={() => onHover(null)}
                      onFocus={() => onHover(item.slug)}
                      onBlur={() => onHover(null)}
                      onClick={() => onOrder(item.slug)}
                    >
                      <span className={styles.name}>{item.name}</span>
                      <span className={styles.dots} aria-hidden="true" />
                      <span className={tasted ? styles.tasted : styles.kind}>{tasted ? '맛봄' : item.kind}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <div className={styles.cover}>
        <div className={styles.front}>
          <button type="button" className={styles.coverButton} aria-expanded={open} disabled={open} onClick={onOpen}>
            <span className={styles.coverSeal} aria-hidden="true">
              국수
            </span>
            <span className={styles.coverTitle}>국수집</span>
            <span className={styles.coverSub}>차림표</span>
            <span className={styles.coverOwner}>주인장 {owner.name}</span>
          </button>
        </div>

        <section className={`${styles.leaf} ${styles.inside}`} aria-labelledby="welcome-title" inert={!open}>
          <h2 id="welcome-title" className={styles.pageTitle}>
            어서 오세요
          </h2>
          <p>{owner.bio}</p>
          <p>메뉴를 고르면 프로젝트 소개가 열려요. 둘러본 메뉴는 상 위에 그릇으로 남아요.</p>
          <dl className={styles.info}>
            <dt>주인장</dt>
            <dd>
              {owner.name} ({owner.handle})
            </dd>
            <dt>깃허브</dt>
            <dd>
              <a href={owner.github} target="_blank" rel="noreferrer">
                {owner.github.replace('https://', '')}
              </a>
            </dd>
            {owner.email !== '' && (
              <>
                <dt>연락처</dt>
                <dd>
                  <a href={`mailto:${owner.email}`}>{owner.email}</a>
                </dd>
              </>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}
