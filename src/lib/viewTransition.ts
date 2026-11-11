import { flushSync } from 'react-dom';

/** 화면을 바꾸는 일을 브라우저의 View Transition으로 감싼다.
 *  바뀌기 전과 후에 같은 view-transition-name을 가진 요소(그릇)가 자리를 옮기듯 이어진다.
 *  지원하지 않는 브라우저이거나 동작 줄이기를 켠 경우에는 바로 바꾼다. */
export function withViewTransition(update: () => void): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) {
    update();
    return;
  }
  // React가 콜백 안에서 화면을 다 그려야 브라우저가 바뀐 뒤 모습을 찍을 수 있다
  const transition = document.startViewTransition(() => flushSync(update));
  // 전환이 끝나기 전에 다음 전환이 시작되면 앞의 것은 건너뛴다. 화면은 이미 바뀌었으니 오류로 올리지 않는다
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}
