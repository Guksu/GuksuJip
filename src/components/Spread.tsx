import { menu } from '../data/menu';
import { Bowl } from './Bowl';
import styles from './Spread.module.css';

/** 상 위에서 그릇이 놓이는 자리. 차림표 순서대로 [가로 %, 세로 %].
 *  오른쪽 아래는 계산서 자리로 비워 둔다. */
const SLOTS: ReadonlyArray<readonly [number, number]> = [
  [20, 12],
  [50, 14],
  [80, 11],
  [22, 31],
  [52, 33],
  [81, 30],
  [19, 50],
  [50, 52],
  [80, 49],
  [21, 69],
  [51, 71],
  [81, 68],
  [20, 88],
];

interface SpreadProps {
  open: boolean;
  ordered: string[];
  /** 지금 가리키고 있는 메뉴. 화면 전환 때 이 그릇이 상세의 큰 그릇으로 이어진다 */
  active: string | null;
  onHover: (slug: string | null) => void;
  onOrder: (slug: string) => void;
  onShowCheck: () => void;
}

/** 차려진 상. 주문한 그릇이 제자리에 놓이고, 가리키고 있는 메뉴는 놓일 자리에 흐리게 비친다. */
export function Spread({ open, ordered, active, onHover, onOrder, onShowCheck }: SpreadProps) {
  const ghost = active && !ordered.includes(active) ? menu.find((item) => item.slug === active) : undefined;

  return (
    <section className={styles.spread} data-open={open} aria-labelledby="spread-title" inert={!open}>
      <h2 id="spread-title" className={styles.title}>
        차려진 상 <span className={styles.count}>{ordered.length}그릇</span>
      </h2>

      {open && ordered.length === 0 && !ghost && <p className={styles.empty}>둘러본 프로젝트가 그릇으로 남아요</p>}

      <ul className={styles.bowls}>
        {menu.map((item, index) => {
          if (!ordered.includes(item.slug)) return null;
          const [x, y] = SLOTS[index];
          const isActive = active === item.slug;
          return (
            <li key={item.slug} className={styles.place} style={{ left: `${x}%`, top: `${y}%` }}>
              <button
                type="button"
                className={styles.served}
                data-active={isActive}
                style={{ viewTransitionName: isActive ? 'bowl' : undefined }}
                onPointerEnter={() => onHover(item.slug)}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(item.slug)}
                onBlur={() => onHover(null)}
                onClick={() => onOrder(item.slug)}
              >
                <Bowl spec={item.bowl} className={styles.bowl} />
                <span className={styles.tag}>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {ghost && (
        <div
          className={styles.ghost}
          aria-hidden="true"
          style={{
            left: `${SLOTS[menu.indexOf(ghost)][0]}%`,
            top: `${SLOTS[menu.indexOf(ghost)][1]}%`,
            viewTransitionName: 'bowl',
          }}
        >
          <Bowl spec={ghost.bowl} className={styles.bowl} />
        </div>
      )}

      {ordered.length > 0 && (
        <button type="button" className={styles.check} onClick={onShowCheck}>
          <span className={styles.checkTitle}>계산서</span>
          <span className={styles.checkCount}>
            {ordered.length}그릇 / {menu.length}
          </span>
          <span className={styles.checkGo}>펼쳐 보기</span>
        </button>
      )}
    </section>
  );
}
