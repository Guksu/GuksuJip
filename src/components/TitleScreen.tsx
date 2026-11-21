import { useEffect, useRef, type KeyboardEvent } from 'react';
import { owner } from '../data/owner';
import styles from './TitleScreen.module.css';

interface TitleScreenProps {
  soundOn: boolean;
  onStart: () => void;
  onSkip: () => void;
  onToggleSound: () => void;
  /** 메뉴 사이를 옮겨 다닐 때 */
  onMove: () => void;
}

/** 가게 앞에 얹는 게임 타이틀 화면. 메뉴는 위아래 화살표로도 옮겨 다닌다. */
export function TitleScreen({ soundOn, onStart, onSkip, onToggleSound, onMove }: TitleScreenProps) {
  const list = useRef<HTMLUListElement>(null);

  // 열리자마자 Enter로 시작할 수 있게 첫 메뉴에 포커스를 둔다
  useEffect(() => {
    list.current?.querySelector('button')?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const buttons = [...(list.current?.querySelectorAll('button') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length];
    next?.focus();
    event.preventDefault();
  };

  return (
    <div className={styles.title}>
      <div className={styles.head}>
        <h1 className={styles.logo}>국수집</h1>
        <p className={styles.sub}>
          {owner.name}({owner.handle})의 프로젝트 차림표
        </p>
      </div>

      <ul ref={list} className={styles.menu} onKeyDown={onKeyDown}>
        <li>
          <button type="button" className={styles.item} onClick={onStart} onFocus={onMove} onPointerEnter={onMove}>
            가게 들어가기
          </button>
        </li>
        <li>
          <button type="button" className={styles.item} onClick={onSkip} onFocus={onMove} onPointerEnter={onMove}>
            차림표 바로 보기
          </button>
        </li>
        <li>
          <button type="button" className={styles.item} aria-pressed={soundOn} onClick={onToggleSound} onFocus={onMove} onPointerEnter={onMove}>
            소리 {soundOn ? '켜짐' : '꺼짐'}
          </button>
        </li>
      </ul>

      <p className={styles.foot}>문을 눌러도 들어갈 수 있어요</p>
    </div>
  );
}
