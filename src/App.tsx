import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { findMenu, menu } from './data/menu';
import { useHashRoute } from './hooks/useHashRoute';
import { useOrdered } from './hooks/useOrdered';
import { withViewTransition } from './lib/viewTransition';
import { Home } from './components/Home';
import { ProjectDetail } from './components/ProjectDetail';

const SITE_TITLE = '국수집 — Guksu의 차림표';
const SLUGS = menu.map((item) => item.slug);

export function App() {
  const { slug, go } = useHashRoute();
  const item = findMenu(slug);
  const { ordered, add, clear } = useOrdered(SLUGS);
  // 차림표를 펼쳤는지. 상에 그릇이 있거나 메뉴 주소로 바로 들어왔으면 펼친 채로 시작한다
  const [open, setOpen] = useState(() => ordered.length > 0 || item !== undefined);
  // 방금 본 메뉴. 차림표로 돌아갔을 때 그 줄과 그릇을 가리킨다
  const [last, setLast] = useState<string | null>(null);
  // 차림표를 떠날 때의 스크롤 위치(좁은 화면에서는 차림표가 길다)
  const homeScroll = useRef(0);

  // 소개를 본 메뉴는 주문한 것으로 적어 둔다
  useEffect(() => {
    if (!item) return;
    add(item.slug);
    setLast(item.slug);
    setOpen(true);
  }, [item, add]);

  // 없는 메뉴 주소로 들어오면 차림표로 돌려보낸다
  useEffect(() => {
    if (slug && !item) go(null);
  }, [slug, item, go]);

  useEffect(() => {
    document.title = item ? `${item.name} · 국수집` : SITE_TITLE;
  }, [item]);

  // 차림표로 돌아오면 떠날 때 보던 자리로 되돌린다
  useLayoutEffect(() => {
    if (!item) window.scrollTo(0, homeScroll.current);
  }, [item]);

  const order = useCallback(
    (next: string) => {
      if (!item) homeScroll.current = window.scrollY;
      go(next);
    },
    [go, item],
  );

  const close = useCallback(() => go(null), [go]);

  const openBook = useCallback(() => {
    // 넓은 화면에서는 표지가 넘어가는 움직임이 있고, 좁은 화면에서는 화면이 통째로 바뀌므로 전환으로 감싼다
    if (window.matchMedia('(min-width: 900px)').matches) setOpen(true);
    else withViewTransition(() => setOpen(true));
  }, []);

  const clearTable = useCallback(() => {
    clear();
    setLast(null);
  }, [clear]);

  if (item) return <ProjectDetail key={item.slug} item={item} onClose={close} onMove={order} />;
  return <Home open={open} ordered={ordered} last={last} onOpen={openBook} onOrder={order} onClear={clearTable} />;
}
