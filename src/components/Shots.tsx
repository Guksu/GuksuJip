import type { MenuItem } from '../data/menu';
import { shotsOf } from '../data/shots';
import styles from './Shots.module.css';

/** 소개 맨 위에 놓는 대표 화면.
 *  앱은 스토어 소개 이미지를 옆으로 넘겨 보고, 웹은 첫 화면 한 장을 크게 보여 준다.
 *  화면이 없는 CLI·스킬은 터미널 출력 같은 글자 자료를 보여 준다. */
export function LeadShots({ item }: { item: MenuItem }) {
  const shots = shotsOf(item.slug);

  if (shots.length === 0) {
    if (!item.exhibit) return null;
    return (
      <figure className={styles.figure}>
        {/* 가로로 긴 출력은 키보드로도 넘겨 볼 수 있게 한다 */}
        <pre className={styles.term} tabIndex={0}>
          {item.exhibit.text}
        </pre>
        <figcaption className={styles.caption}>{item.exhibit.caption}</figcaption>
      </figure>
    );
  }

  if (item.category === 'app') {
    return (
      <div className={styles.phones} role="group" aria-label={`${item.name} 화면`} tabIndex={0}>
        {shots.map((shot, index) => (
          <img
            key={shot.src}
            className={styles.phone}
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            loading={index < 3 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
    );
  }

  const [first] = shots;
  return (
    <figure className={styles.figure}>
      <img className={styles.screen} src={first.src} width={first.width} height={first.height} alt={first.alt} decoding="async" />
    </figure>
  );
}

/** 대표 화면 말고 남은 화면들. 웹 프로젝트에만 있다. */
export function MoreShots({ item }: { item: MenuItem }) {
  const rest = item.category === 'app' ? [] : shotsOf(item.slug).slice(1);
  if (rest.length === 0) return null;

  return (
    <section className={styles.more} aria-labelledby="more-shots">
      <h2 id="more-shots" className={styles.moreTitle}>
        화면 더 보기
      </h2>
      <div className={styles.grid}>
        {rest.map((shot) => (
          <img
            key={shot.src}
            className={styles.screen}
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
      {item.shotNote && <p className={styles.caption}>{item.shotNote}</p>}
    </section>
  );
}
