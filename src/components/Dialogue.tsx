import styles from './Dialogue.module.css';

// 주인장 초상화 — 12×12칸 픽셀 그림. 장면의 주인장과 같은 색을 쓴다
const ROWS = [
  '..hhhhhhhh..',
  '.hhhhhhhhhh.',
  '.wwwwwwwrww.',
  '.wwwwwwwwww.',
  '.hsbbssbbsh.',
  '.hssssssssh.',
  '.sseesseess.',
  '.sssssssss..',
  '.scssssscs..',
  '..ssmmmmss..',
  '...ssssss...',
  '.cccssssccc.',
];
const COLORS: Record<string, string> = {
  h: '#1c1917', // 머리카락
  w: '#f6f2e8', // 머리띠
  r: '#b23a26',
  s: '#dba27c', // 살
  b: '#1c1917', // 눈썹
  e: '#1c1917', // 눈
  c: '#f1ede3', // 옷깃
  m: '#6e2f22', // 입
};

function Portrait() {
  return (
    <svg className={styles.portrait} viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {ROWS.flatMap((row, y) =>
        [...row].map((cell, x) => (cell === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLORS[cell]} />)),
      )}
    </svg>
  );
}

interface DialogueProps {
  show: boolean;
  /** 지금까지 찍힌 글 */
  typed: string;
  /** 아직 안 찍힌 글. 자리만 차지해서 줄바꿈이 바뀌지 않게 한다 */
  rest: string;
}

/** 화면 아래의 대화창. 주인장 초상화 옆에 말이 한 글자씩 찍힌다.
 *  읽어 주는 글은 Shop이 따로 한 번에 두므로 여기는 눈으로만 보는 것이다. */
export function Dialogue({ show, typed, rest }: DialogueProps) {
  return (
    <div className={styles.dialogue} data-show={show} aria-hidden="true">
      <Portrait />
      <div className={styles.body}>
        <p className={styles.name}>주인장</p>
        <p className={styles.text}>
          {typed}
          <span className={styles.rest}>{rest}</span>
        </p>
      </div>
    </div>
  );
}
