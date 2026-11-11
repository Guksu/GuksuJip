import { useCallback, useEffect, useRef, useState } from 'react';
import { withViewTransition } from '../lib/viewTransition';

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

/** 주소의 해시로 지금 고른 메뉴를 알려 주고, go로 주소와 화면을 함께 바꾼다.
 *  GitHub Pages는 서버 라우팅이 없어서 해시 주소를 쓴다.
 *  화면이 바뀔 때는 View Transition으로 감싸서, 뒤로 가기에도 같은 전환이 일어난다. */
export function useHashRoute(): { slug: string | null; go: (slug: string | null) => void } {
  const [slug, setSlug] = useState<string | null>(() => parseHash(window.location.hash));
  const current = useRef(slug);

  const show = useCallback((next: string | null) => {
    if (next === current.current) return;
    current.current = next;
    withViewTransition(() => setSlug(next));
  }, []);

  // 뒤로·앞으로 가기, 주소창에서 해시를 직접 고친 경우
  useEffect(() => {
    const onChange = () => show(parseHash(window.location.hash));
    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
    };
  }, [show]);

  const go = useCallback(
    (next: string | null) => {
      if (next === current.current) return;
      window.history.pushState(null, '', toHash(next));
      show(next);
    },
    [show],
  );

  return { slug, go };
}
