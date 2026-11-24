import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { categories, menu, menuByCategory, type MenuItem } from '../data/menu';
import { BowlIcon } from './BowlIcon';
import styles from './MenuBoard.module.css';

interface MenuBoardProps {
  show: boolean;
  /** 이미 맛본(소개를 본) 메뉴 */
  ordered: string[];
  /** 방금 보고 온 메뉴. 차림으로 돌아오면 그 줄부터 고른다 */
  last: string | null;
  onPoint: (item: MenuItem) => void;
  onOrder: (slug: string) => void;
  onShowCheck: () => void;
  onLeave: () => void;
}

/** 오늘의 차림. 왼쪽에서 국수를 고르면 오른쪽 카드에 그 프로젝트가 나오고, 주문하면 주인장이 만들기 시작한다. */
export function MenuBoard({ show, ordered, last, onPoint, onOrder, onShowCheck, onLeave }: MenuBoardProps) {
  const root = useRef<HTMLElement>(null);
  const [picked, setPicked] = useState<string>(last ?? menu[0].slug);
  const item = menu.find((entry) => entry.slug === picked) ?? menu[0];
  const index = menu.indexOf(item);
  const category = categories.find((entry) => entry.id === item.category);
  const tasted = ordered.includes(item.slug);

  // 차림이 열리면 보던 줄로 포커스를 옮긴다
  useEffect(() => {
    if (!show) return;
    const slug = last ?? picked;
    setPicked(slug);
    root.current?.querySelector<HTMLElement>(`button[data-slug="${slug}"]`)?.focus({ preventScroll: true });
    // 열릴 때만 맞춘다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, last]);

  const pick = (next: MenuItem) => {
    if (next.slug === picked) return;
    setPicked(next.slug);
    onPoint(next);
  };

  // 위아래 화살표로 줄을 옮기고, Enter로 주문한다
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = menu[(index + step + menu.length) % menu.length];
    pick(next);
    root.current?.querySelector<HTMLElement>(`button[data-slug="${next.slug}"]`)?.focus();
    event.preventDefault();
  };

  return (
    <section ref={root} className={styles.board} data-show={show} aria-labelledby="board-title" inert={!show} onKeyDown={onKeyDown}>
      <header className={styles.head}>
        <h2 id="board-title" className={styles.title}>
          오늘의 차림
        </h2>
        <p className={styles.progress}>국수 {menu.length}가지</p>
      </header>

      <div className={styles.body}>
        <div className={styles.list}>
          {categories.map((entry) => (
            <div key={entry.id} className={styles.group}>
              <h3 className={styles.groupTitle}>{entry.title}</h3>
              <ul>
                {menuByCategory(entry.id).map((row) => (
                  <li key={row.slug}>
                    <button
                      type="button"
                      className={styles.row}
                      data-slug={row.slug}
                      aria-pressed={row.slug === picked}
                      onFocus={() => pick(row)}
                      onClick={() => (row.slug === picked ? onOrder(row.slug) : pick(row))}
                      onDoubleClick={() => onOrder(row.slug)}
                    >
                      <BowlIcon spec={row.bowl} radius={5} scale={2} className={styles.rowIcon} />
                      <span className={styles.rowDish}>{row.dish}</span>
                      {ordered.includes(row.slug) && <span className={styles.done}>맛봄</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 고른 국수의 카드. 재료 칸에는 프로젝트에 쓴 기술이 들어간다 */}
        <div className={styles.card} aria-live="polite">
          <div className={styles.cardArt}>
            <BowlIcon spec={item.bowl} radius={20} scale={3} />
          </div>
          <p className={styles.cardNo}>
            No. {String(index + 1).padStart(2, '0')}
            {tasted && <span className={styles.done}>맛봄</span>}
          </p>
          <p className={styles.cardDish}>{item.dish}</p>
          <p className={styles.cardName}>{item.name}</p>
          <p className={styles.cardLine}>{item.tagline}</p>
          <dl className={styles.stats}>
            <div>
              <dt>분류</dt>
              <dd>{category?.title}</dd>
            </div>
            <div>
              <dt>종류</dt>
              <dd>{item.kind}</dd>
            </div>
            <div>
              <dt>재료</dt>
              <dd>{item.stack.join(' · ')}</dd>
            </div>
          </dl>
          <button type="button" className={styles.order} onClick={() => onOrder(item.slug)}>
            {tasted ? '한 그릇 더' : '주문하기'}
            <kbd className={styles.key}>Enter</kbd>
          </button>
        </div>
      </div>

      <footer className={styles.foot}>
        <button type="button" className={styles.textButton} onClick={onLeave}>
          가게 밖으로
        </button>
        <p className={styles.keys} aria-hidden="true">
          <kbd className={styles.key}>↑</kbd>
          <kbd className={styles.key}>↓</kbd> 고르기
        </p>
        {ordered.length > 0 && (
          <button type="button" className={styles.textButton} onClick={onShowCheck}>
            계산서 {ordered.length}그릇
          </button>
        )}
      </footer>
    </section>
  );
}
