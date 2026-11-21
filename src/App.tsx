import { useCallback, useEffect } from 'react';
import { findMenu } from './data/menu';
import { useHashRoute } from './hooks/useHashRoute';
import { useOrdered } from './hooks/useOrdered';
import { Shop } from './components/Shop';

const SITE_TITLE = '국수집 — Guksu의 차림표';

export function App() {
  const { slug, go } = useHashRoute();
  const item = findMenu(slug);
  const { ordered, add, clear } = useOrdered();

  // 소개를 본 메뉴는 맛본 것으로 적어 둔다
  useEffect(() => {
    if (item) add(item.slug);
  }, [item, add]);

  // 없는 메뉴 주소로 들어오면 차림표로 돌려보낸다
  useEffect(() => {
    if (slug && !item) go(null);
  }, [slug, item, go]);

  useEffect(() => {
    document.title = item ? `${item.name} · 국수집` : SITE_TITLE;
  }, [item]);

  const close = useCallback(() => go(null), [go]);

  return <Shop item={item} ordered={ordered} onOrder={go} onClose={close} onClear={clear} />;
}
