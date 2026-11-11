import type { MenuItem } from '../data/menu';
import { Bowl } from './Bowl';
import styles from './MenuPlank.module.css';

interface MenuPlankProps {
  item: MenuItem;
  onOrder: (slug: string) => void;
}

/** 차림표에 걸린 팻말 하나. 누르면 그 메뉴를 주문한다. */
export function MenuPlank({ item, onOrder }: MenuPlankProps) {
  return (
    <button type="button" className={styles.plank} data-slug={item.slug} onClick={() => onOrder(item.slug)}>
      <Bowl spec={item.bowl} className={styles.bowl} />
      <span className={styles.text}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.tagline}>{item.tagline}</span>
      </span>
      <span className={styles.kind}>{item.kind}</span>
    </button>
  );
}
