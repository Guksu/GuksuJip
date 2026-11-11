import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { findMenu, menu } from './data/menu';
import { useHashRoute } from './hooks/useHashRoute';
import { MenuBoard } from './components/MenuBoard';
import { OrderScene, type Intro } from './components/OrderScene';

const SITE_TITLE = '국수집 — Guksu의 차림표';

export function App() {
  const { slug, go } = useHashRoute();
  const item = findMenu(slug);
  // 화면 안에서 고른 메뉴와 그 방법. 주소로 바로 들어온 메뉴는 여기에 없어서 움직임 없이 열린다.
  const picked = useRef<{ slug: string; intro: Intro } | null>(null);
  // 차림표로 돌아갈 때 포커스를 돌려줄 팻말
  const lastOrdered = useRef<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const order = useCallback(
    (next: string) => {
      picked.current = { slug: next, intro: 'full' };
      lastOrdered.current = next;
      go(next);
    },
    [go],
  );

  const move = useCallback(
    (next: string) => {
      picked.current = { slug: next, intro: 'serve' };
      lastOrdered.current = next;
      go(next);
    },
    [go],
  );

  const close = useCallback(() => go(null), [go]);

  // 없는 메뉴 주소로 들어오면 차림표 주소로 바꾼다
  useEffect(() => {
    if (slug && !item) go(null);
  }, [slug, item, go]);

  useEffect(() => {
    document.title = item ? `${item.name} · 국수집` : SITE_TITLE;
  }, [item]);

  // 소개 화면을 닫으면 주문했던 팻말로 포커스를 돌려준다
  useEffect(() => {
    if (item || !lastOrdered.current) return;
    const plank = boardRef.current?.querySelector<HTMLElement>(`[data-slug="${lastOrdered.current}"]`);
    plank?.focus({ preventScroll: true });
    lastOrdered.current = null;
  }, [item]);

  const index = item ? menu.indexOf(item) : -1;
  const intro: Intro = item && picked.current?.slug === item.slug ? picked.current.intro : 'none';

  return (
    <>
      <div ref={boardRef} inert={item !== undefined}>
        <MenuBoard onOrder={order} />
      </div>
      <AnimatePresence>
        {item && (
          <OrderScene
            key={item.slug}
            item={item}
            number={index + 1}
            intro={intro}
            prev={menu[(index - 1 + menu.length) % menu.length]}
            next={menu[(index + 1) % menu.length]}
            onClose={close}
            onMove={move}
          />
        )}
      </AnimatePresence>
    </>
  );
}
