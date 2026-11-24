/** 국수마다 정해 둔 만드는 장면. 주문하면 그 국수에 맞는 장면이 나온다. */

/** 장면 한 컷 */
export type Cut =
  /** 끓는 솥에 면을 삶는다 */
  | 'boil'
  /** 도마에서 고명을 썬다 */
  | 'chop'
  /** 삶은 면을 찬물에 헹구고 얼음을 띄운다 */
  | 'rinse'
  /** 센 불에 웍을 돌린다 */
  | 'wok'
  /** 그릇에 담는다 */
  | 'plate';

export type RecipeKind = 'hot' | 'cold' | 'wok';

export const RECIPES: Record<RecipeKind, Cut[]> = {
  // 따뜻한 국물 국수 — 삶고, 고명을 썰어, 담는다
  hot: ['boil', 'chop', 'plate'],
  // 차게 먹는 국수 — 삶아서 찬물에 헹군 뒤 담는다
  cold: ['boil', 'rinse', 'plate'],
  // 볶아 내는 국수 — 재료를 썰어 센 불에 볶은 뒤 담는다
  wok: ['chop', 'wok', 'plate'],
};

export const CUT_NAMES: Record<Cut, string> = {
  boil: '면 삶기',
  chop: '고명 썰기',
  rinse: '찬물에 헹구기',
  wok: '센 불에 볶기',
  plate: '그릇에 담기',
};

/** 메뉴 주소 이름 → 만드는 방식. 적지 않은 메뉴는 따뜻한 국물 국수로 만든다 */
const BY_SLUG: Record<string, RecipeKind> = {
  // 콩국수, 물냉면, 메밀 막국수, 비빔국수, 김치말이국수
  geulppal: 'cold',
  'qa-recorder': 'cold',
  foldlab: 'cold',
  noodlelens: 'cold',
  'been-a-while': 'cold',
  // 짬뽕, 짜장면
  tokkaebi: 'wok',
  builbook: 'wok',
};

export function recipeOf(slug: string): RecipeKind {
  return BY_SLUG[slug] ?? 'hot';
}

export const COOKED_SLUGS = Object.keys(BY_SLUG);
