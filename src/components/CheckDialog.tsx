import { useEffect, useRef } from 'react';
import { menu } from '../data/menu';
import { owner } from '../data/owner';
import styles from './CheckDialog.module.css';

interface CheckDialogProps {
  open: boolean;
  ordered: string[];
  onClose: () => void;
  /** 상을 치운다(주문 기록을 지운다) */
  onClear: () => void;
}

/** 계산서. 맛본 메뉴를 적어 보여 주고 주인장에게 연락하는 길로 이어진다.
 *  브라우저의 <dialog>를 써서 포커스 가두기와 Esc 닫기를 그대로 받는다. */
export function CheckDialog({ open, ordered, onClose, onClear }: CheckDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const items = ordered.map((slug) => menu.find((item) => item.slug === slug)).filter((item) => item !== undefined);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="check-title"
      onClose={onClose}
      // 종이 바깥(어두운 바탕)을 누르면 닫는다
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.paper}>
        <h2 id="check-title" className={styles.title}>
          계산서
        </h2>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.slug}>
              <span>{item.name}</span>
              <span>{item.dish}</span>
            </li>
          ))}
        </ul>
        <p className={styles.total}>
          <span>합계</span>
          <span>
            {items.length}그릇 / {menu.length}
          </span>
        </p>
        <p className={styles.note}>값은 받지 않아요. 드신 소감을 들려주세요.</p>
        <div className={styles.actions}>
          {owner.email !== '' && (
            <a className={styles.primary} href={`mailto:${owner.email}`}>
              메일 보내기
            </a>
          )}
          <a className={styles.link} href={owner.github} target="_blank" rel="noreferrer">
            깃허브 보기
          </a>
        </div>
        <div className={styles.foot}>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              onClear();
              onClose();
            }}
          >
            상 치우기
          </button>
          <button type="button" className={styles.textButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </dialog>
  );
}
