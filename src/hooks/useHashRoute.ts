import { useCallback, useSyncExternalStore } from 'react';

const PREFIX = '#/menu/';

/** '#/menu/suta' → 'suta'. 메뉴 주소가 아니면 null. */
export function parseHash(hash: string): string | null {
  if (!hash.startsWith(PREFIX)) return null;
  const slug = decodeURIComponent(hash.slice(PREFIX.length)).replace(/\/+$/, '');
  return slug === '' ? null : slug;
}

/** 'suta' → '#/menu/suta'. null이면 차림표 주소 '#/'. */
export function toHash(slug: string | null): string {
  return slug ? `${PREFIX}${encodeURIComponent(slug)}` : '#/';
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** 주소의 해시를 읽어 지금 고른 메뉴를 알려 주고, go로 주소를 바꾼다.
 *  GitHub Pages는 서버 라우팅이 없어서 해시 주소를 쓴다. */
export function useHashRoute(): { slug: string | null; go: (slug: string | null) => void } {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  );
  const go = useCallback((slug: string | null) => {
    window.location.hash = toHash(slug);
  }, []);
  return { slug: parseHash(hash), go };
}
