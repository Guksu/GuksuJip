import { useCallback, useState } from 'react';

/** 맛본 목록에 메뉴를 더한다. 이미 있으면 그대로 돌려준다. */
export function addOrdered(list: readonly string[], slug: string): string[] {
  return list.includes(slug) ? (list as string[]) : [...list, slug];
}

/** 이번 방문에서 맛본(소개를 본) 메뉴. 저장하지 않으므로 다시 들어오면 빈 카운터에서 시작한다. */
export function useOrdered() {
  const [ordered, setOrdered] = useState<string[]>([]);

  const add = useCallback((slug: string) => setOrdered((list) => addOrdered(list, slug)), []);
  const clear = useCallback(() => setOrdered([]), []);

  return { ordered, add, clear };
}
