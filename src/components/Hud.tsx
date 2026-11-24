import { menu } from '../data/menu';
import styles from './Hud.module.css';

interface HudProps {
  /** 맛본 메뉴 */
  ordered: string[];
  /** 지금 할 일. 없으면 줄을 그리지 않는다 */
  objective: string | null;
  /** 방금 맛본 메뉴를 알리는 글. 없으면 알림을 치운다 */
  toast: { dish: string; name: string } | null;
  soundOn: boolean;
  onToggleSound: () => void;
}

/** 가게 안에서 늘 보이는 게임 화면 표시. 맛본 그릇 수, 지금 할 일, 새로 맛본 국수 알림을 보여 준다. */
export function Hud({ ordered, objective, toast, soundOn, onToggleSound }: HudProps) {
  return (
    <>
      <div className={styles.hud}>
        <p className={styles.plate}>
          <span className={styles.label}>맛본 국수</span>
          <span className={styles.pips} aria-hidden="true">
            {menu.map((item) => (
              <i key={item.slug} className={styles.pip} data-on={ordered.includes(item.slug)} />
            ))}
          </span>
          <span className={styles.count}>
            {ordered.length}
            <span className={styles.total}>/{menu.length}</span>
            <span className="sr-only">그릇</span>
          </span>
        </p>
        <button type="button" className={styles.chip} aria-pressed={soundOn} onClick={onToggleSound}>
          소리 {soundOn ? '켜짐' : '꺼짐'}
        </button>
        {objective && (
          <p className={styles.objective}>
            <span className={styles.label}>할 일</span>
            {objective}
          </p>
        )}
      </div>

      <p className={styles.toast} data-show={toast !== null} aria-live="polite">
        {toast && (
          <>
            <span className={styles.toastTitle}>
              새 국수 {ordered.length}/{menu.length}
            </span>
            <span className={styles.toastBody}>
              {toast.dish} · {toast.name}
            </span>
          </>
        )}
      </p>
    </>
  );
}
