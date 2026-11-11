import { categories, menu, menuByCategory } from '../data/menu';
import { owner } from '../data/owner';
import { MenuPlank } from './MenuPlank';
import styles from './MenuBoard.module.css';

interface MenuBoardProps {
  onOrder: (slug: string) => void;
}

/** 메인 화면. 국숫집 벽에 걸린 차림표와 가게 정보. */
export function MenuBoard({ onOrder }: MenuBoardProps) {
  return (
    <div className={styles.wall}>
      <header className={styles.sign}>
        <span className={styles.stamp} aria-hidden="true">
          국수
        </span>
        <h1 className={styles.title}>국수집 차림표</h1>
        <p className={styles.lede}>
          {owner.handle}가 만든 것들을 걸어 두었어요. 메뉴를 고르면 한 그릇 내어 드릴게요.
        </p>
      </header>

      <main className={styles.board}>
        {categories.map((category) => {
          const items = menuByCategory(category.id);
          return (
            <section key={category.id} className={styles.category} aria-labelledby={`category-${category.id}`}>
              <h2 id={`category-${category.id}`} className={styles.categoryTitle}>
                {category.title}
                <span className={styles.count}>{items.length}가지</span>
              </h2>
              <ul className={styles.planks}>
                {items.map((item) => (
                  <li key={item.slug}>
                    <MenuPlank item={item} onOrder={onOrder} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>

      <footer className={styles.shop}>
        <h2 className={styles.shopTitle}>가게 정보</h2>
        <dl className={styles.info}>
          <div className={styles.row}>
            <dt>주인장</dt>
            <dd>
              {owner.name} ({owner.handle})
            </dd>
          </div>
          <div className={styles.row}>
            <dt>소개</dt>
            <dd>{owner.bio}</dd>
          </div>
          <div className={styles.row}>
            <dt>차림</dt>
            <dd>모두 {menu.length}가지</dd>
          </div>
          <div className={styles.row}>
            <dt>깃허브</dt>
            <dd>
              <a className={styles.link} href={owner.github} target="_blank" rel="noreferrer">
                {owner.github.replace('https://', '')}
              </a>
            </dd>
          </div>
          {owner.email !== '' && (
            <div className={styles.row}>
              <dt>연락처</dt>
              <dd>
                <a className={styles.link} href={`mailto:${owner.email}`}>
                  {owner.email}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </footer>
    </div>
  );
}
