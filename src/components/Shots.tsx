import type { CSSProperties } from 'react';
import type { MenuItem } from '../data/menu';
import { shotsOf, type Shot } from '../data/shots';
import styles from './Shots.module.css';

/** 세로로 긴 화면(앱 화면, 확장 프로그램의 사이드 패널)은 옆으로 나란히 놓고 넘겨 본다.
 *  폭 가득 한 장씩 놓으면 화면 하나가 스크롤 두세 번 길이가 된다. */
function isStrip(item: MenuItem, shots: Shot[]): boolean {
  return item.category === 'app' || shots.every((shot) => shot.height > shot.width);
}

/** 소개 맨 위에 놓는 대표 화면.
 *  세로 화면은 옆으로 넘겨 보고, 가로 화면은 첫 화면 한 장을 크게 보여 준다.
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

  if (isStrip(item, shots)) {
    const app = item.category === 'app';
    // 넓은 화면에서 한 번에 보이는 장수. 앱 화면은 네 장, 글자가 작은 패널 화면은 두 장 반.
    // 장수가 더 많으면 반 장을 걸쳐 두어 옆에 더 있음을 알린다
    const perView = app ? (shots.length > 4 ? 4.5 : 4) : 2.5;
    const style = { '--per-view': perView, '--shot-min': app ? '168px' : '220px' } as CSSProperties;
    return (
      <figure className={styles.figure}>
        <div className={styles.phones} role="group" aria-label={`${item.name} 화면`} tabIndex={0} style={style}>
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
        {item.shotNote && <figcaption className={styles.caption}>{item.shotNote}</figcaption>}
      </figure>
    );
  }

  const [first] = shots;
  return (
    <figure className={styles.figure}>
      <img className={styles.screen} src={first.src} width={first.width} height={first.height} alt={first.alt} decoding="async" />
    </figure>
  );
}

/** 대표 화면 말고 남은 가로 화면들. 비율이 서로 달라서 한 열로 쌓는다. */
export function MoreShots({ item }: { item: MenuItem }) {
  const shots = shotsOf(item.slug);
  const rest = shots.length === 0 || isStrip(item, shots) ? [] : shots.slice(1);
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
