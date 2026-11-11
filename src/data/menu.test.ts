import { describe, expect, it } from 'vitest';
import { categories, findMenu, menu, menuByCategory } from './menu';
import { parseHash, toHash } from '../hooks/useHashRoute';

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

  it('모든 메뉴에 소개·맛 포인트·재료가 있다', () => {
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
