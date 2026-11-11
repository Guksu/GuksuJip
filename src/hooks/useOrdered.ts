import { useCallback, useEffect, useState } from 'react';

const STORE_KEY = 'guksujip:ordered';

/** 저장해 둔 값을 주문 목록으로 읽는다. 깨진 값이거나 지금은 없는 메뉴면 버린다. */
export function parseOrdered(raw: string | null, validSlugs: readonly string[]): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const known = value.filter((slug): slug is string => typeof slug === 'string' && validSlugs.includes(slug));
    return [...new Set(known)];
  } catch {
    return [];
  }
}

/** 주문 목록에 메뉴를 더한다. 이미 있으면 그대로 돌려준다. */
export function addOrdered(list: readonly string[], slug: string): string[] {
  return list.includes(slug) ? (list as string[]) : [...list, slug];
}

function read(validSlugs: readonly string[]): string[] {
  try {
    return parseOrdered(window.localStorage.getItem(STORE_KEY), validSlugs);
  } catch {
    // 사생활 보호 모드처럼 저장소를 못 쓰는 경우
    return [];
  }
}

/** 지금까지 주문한(소개를 본) 메뉴. 브라우저에 저장해서 다시 들어와도 상이 그대로다. */
export function useOrdered(validSlugs: readonly string[]) {
  const [ordered, setOrdered] = useState<string[]>(() => read(validSlugs));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(ordered));
    } catch {
      // 저장하지 못해도 이번 방문 동안은 그대로 동작한다
    }
  }, [ordered]);

  const add = useCallback((slug: string) => setOrdered((list) => addOrdered(list, slug)), []);
  const clear = useCallback(() => setOrdered([]), []);

  return { ordered, add, clear };
}
