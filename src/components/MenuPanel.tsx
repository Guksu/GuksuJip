import { useEffect, useRef } from 'react';
import { categories, menuByCategory, type MenuItem } from '../data/menu';
import styles from './MenuPanel.module.css';

interface MenuPanelProps {
  show: boolean;
  /** 이미 맛본(소개를 본) 메뉴 */
  ordered: string[];
  /** 방금 보고 온 메뉴. 차림표로 돌아오면 그 줄로 포커스를 돌려준다 */
  last: string | null;
  onPoint: (item: MenuItem) => void;
  onOrder: (slug: string) => void;
  onShowCheck: () => void;
  onLeave: () => void;
}

/** 주인장이 건네준 차림표. 메뉴를 고르면 주문이 들어간다. */
export function MenuPanel({ show, ordered, last, onPoint, onOrder, onShowCheck, onLeave }: MenuPanelProps) {
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // 차림표가 열리면 보던 줄(없으면 제목)로 포커스를 옮긴다
  useEffect(() => {
    if (!show) return;
    const row = last ? root.current?.querySelector<HTMLElement>(`button[data-slug="${last}"]`) : null;
    (row ?? titleRef.current)?.focus({ preventScroll: true });
  }, [show, last]);

  return (
    <section ref={root} className={styles.menu} data-show={show} aria-labelledby="menu-title" inert={!show}>
      <h2 id="menu-title" ref={titleRef} tabIndex={-1} className={styles.title}>
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
                    onPointerEnter={() => onPoint(item)}
                    onFocus={() => onPoint(item)}
                    onClick={() => onOrder(item.slug)}
                  >
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.dots} aria-hidden="true" />
                    <span className={styles.dish}>{item.dish}</span>
                    {tasted && <span className={styles.tasted}>맛봄</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className={styles.foot}>
        <button type="button" className={styles.textButton} onClick={onLeave}>
          가게 밖으로
        </button>
        {ordered.length > 0 && (
          <button type="button" className={styles.check} onClick={onShowCheck}>
            계산서 {ordered.length}그릇
          </button>
        )}
      </div>
    </section>
  );
}
