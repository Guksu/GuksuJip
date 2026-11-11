import { describe, expect, it } from 'vitest';
import { categories, findMenu, menu, menuByCategory } from './menu';
import { parseHash, toHash } from '../hooks/useHashRoute';
import { addOrdered, parseOrdered } from '../hooks/useOrdered';
import { shotsOf } from './shots';

describe('메뉴 데이터', () => {
  it('주소 이름(slug)이 겹치지 않는다', () => {
    const slugs = menu.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('주소 이름은 영문 소문자·숫자·하이픈만 쓴다', () => {
    for (const item of menu) {
      expect(item.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('모든 메뉴에 소개·주요 기능·사용 기술이 있다', () => {
    for (const item of menu) {
      expect(item.tagline.trim(), item.slug).not.toBe('');
      expect(item.intro.trim(), item.slug).not.toBe('');
      expect(item.points.length, item.slug).toBeGreaterThan(0);
      expect(item.stack.length, item.slug).toBeGreaterThan(0);
    }
  });

  it('링크는 모두 https 주소다', () => {
    for (const item of menu) {
      for (const link of item.links) {
        expect(link.href, `${item.slug} ${link.label}`).toMatch(/^https:\/\//);
      }
    }
  });

  it('비공개 저장소 메뉴에는 깃허브 저장소 링크를 걸지 않는다', () => {
    for (const item of menu.filter((m) => m.privateRepo)) {
      expect(item.links.some((link) => link.href.startsWith('https://github.com/')), item.slug).toBe(false);
    }
  });

  it('모든 메뉴가 분류 하나에 속하고, 빈 분류가 없다', () => {
    const total = categories.reduce((sum, category) => sum + menuByCategory(category.id).length, 0);
    expect(total).toBe(menu.length);
    for (const category of categories) {
      expect(menuByCategory(category.id).length, category.title).toBeGreaterThan(0);
    }
  });

  it('findMenu는 없는 이름에 undefined를 돌려준다', () => {
    expect(findMenu('suta')?.name).toBe('suta');
    expect(findMenu('없는-메뉴')).toBeUndefined();
    expect(findMenu(null)).toBeUndefined();
  });
});

describe('해시 주소', () => {
  it('메뉴 주소에서 이름을 읽는다', () => {
    expect(parseHash('#/menu/suta')).toBe('suta');
    expect(parseHash('#/menu/qa-recorder/')).toBe('qa-recorder');
  });

  it('메뉴 주소가 아니면 null이다', () => {
    expect(parseHash('')).toBeNull();
    expect(parseHash('#/')).toBeNull();
    expect(parseHash('#/menu/')).toBeNull();
    expect(parseHash('#about')).toBeNull();
  });

  it('toHash와 parseHash는 서로 되돌린다', () => {
    for (const item of menu) {
      expect(parseHash(toHash(item.slug))).toBe(item.slug);
    }
    expect(toHash(null)).toBe('#/');
  });
});

describe('제품 화면', () => {
  it('화면도 글자 자료도 없는 메뉴는 정해 둔 것뿐이다', () => {
    const bare = menu.filter((item) => shotsOf(item.slug).length === 0 && !item.exhibit).map((item) => item.slug);
    expect(bare).toEqual(['video-encoder']);
  });

  it('모든 화면에 설명(alt)과 크기가 있다', () => {
    for (const item of menu) {
      for (const shot of shotsOf(item.slug)) {
        expect(shot.alt.trim(), item.slug).not.toBe('');
        expect(shot.width, item.slug).toBeGreaterThan(0);
        expect(shot.height, item.slug).toBeGreaterThan(0);
      }
    }
  });
});

describe('주문 기록', () => {
  const slugs = menu.map((item) => item.slug);

  it('저장된 목록을 읽는다', () => {
    expect(parseOrdered('["suta","gimi"]', slugs)).toEqual(['suta', 'gimi']);
  });

  it('깨진 값, 배열이 아닌 값, 비어 있는 값은 빈 목록으로 본다', () => {
    expect(parseOrdered(null, slugs)).toEqual([]);
    expect(parseOrdered('{', slugs)).toEqual([]);
    expect(parseOrdered('{"suta":true}', slugs)).toEqual([]);
  });

  it('지금은 없는 메뉴와 겹친 메뉴는 버린다', () => {
    expect(parseOrdered('["suta","없는-메뉴",3,"suta"]', slugs)).toEqual(['suta']);
  });

  it('이미 주문한 메뉴는 다시 더하지 않는다', () => {
    expect(addOrdered(['suta'], 'gimi')).toEqual(['suta', 'gimi']);
    expect(addOrdered(['suta'], 'suta')).toEqual(['suta']);
  });
});
