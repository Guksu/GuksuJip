import { useEffect, useRef, useState } from 'react';
import { MenuBook } from './MenuBook';
import { Spread } from './Spread';
import { CheckDialog } from './CheckDialog';
import styles from './Home.module.css';

interface HomeProps {
  /** 차림표가 펼쳐져 있는지 */
  open: boolean;
  ordered: string[];
  /** 방금 소개를 보고 돌아온 메뉴. 그 줄로 포커스를 돌려주고, 그릇이 제자리로 내려앉는 전환에 쓴다 */
  last: string | null;
  onOpen: () => void;
  onOrder: (slug: string) => void;
  onClear: () => void;
}

/** 첫 화면. 빈 상 위에 덮인 차림표 한 권으로 시작하고,
 *  펼친 뒤에는 차림표 옆으로 주문한 그릇이 하나씩 차려진다. */
export function Home({ open, ordered, last, onOpen, onOrder, onClear }: HomeProps) {
  const [hover, setHover] = useState<string | null>(null);
  // 돌아온 직후에는 방금 본 메뉴를 가리키고 있다가, 다른 메뉴를 가리키면 놓는다
  const [pinned, setPinned] = useState<string | null>(last);
  const [checkOpen, setCheckOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const active = hover ?? pinned;
  const point = (slug: string | null) => {
    setHover(slug);
    if (slug) setPinned(null);
  };

  // 소개를 보고 돌아왔으면 그 메뉴의 줄로 포커스를 돌려준다
  useEffect(() => {
    if (!last) return;
    root.current?.querySelector<HTMLElement>(`button[data-slug="${last}"]`)?.focus({ preventScroll: true });
  }, [last]);

  return (
    <main ref={root} className={styles.desk} data-open={open}>
      <h1 className="sr-only">국수집 차림표</h1>

      {/* 수저와 물컵 — 차림표를 펼치면 치운다 */}
      <div className={styles.setting} aria-hidden="true">
        <span className={styles.cup} />
        <span className={styles.chopsticks} />
        <span className={styles.spoon} />
      </div>

      <MenuBook open={open} ordered={ordered} active={active} onOpen={onOpen} onHover={point} onOrder={onOrder} />

      {!open && <p className={styles.hint}>차림표를 눌러 펼쳐 보세요</p>}

      <Spread
        open={open}
        ordered={ordered}
        active={active}
        onHover={point}
        onOrder={onOrder}
        onShowCheck={() => setCheckOpen(true)}
      />

      <CheckDialog open={checkOpen} ordered={ordered} onClose={() => setCheckOpen(false)} onClear={onClear} />
    </main>
  );
}
