import { useId } from 'react';
import type { BowlSpec, Topping } from '../data/menu';

interface BowlProps {
  spec: BowlSpec;
  /** 그림을 설명하는 글. 비우면 장식으로 보고 스크린 리더에서 숨긴다 */
  label?: string;
  className?: string;
}

/** 면 가닥. 중심과 반지름이 다른 원을 일부만 그려 엉킨 면처럼 보이게 한다.
 *  [cx, cy, r, 그릴 길이, 시작 위치] */
const STRANDS: Array<[number, number, number, number, number]> = [
  [150, 150, 88, 300, 0],
  [172, 166, 80, 260, 120],
  [160, 148, 66, 240, 40],
  [146, 170, 70, 230, 200],
  [176, 150, 56, 200, 90],
  [152, 158, 46, 190, 10],
  [168, 172, 40, 170, 150],
  [158, 150, 30, 130, 60],
  [140, 146, 96, 210, 260],
  [178, 176, 92, 200, 330],
];

/** 고명을 놓는 자리. 고명 순서대로 하나씩 쓴다. */
const SPOTS: Array<[number, number]> = [
  [160, 154],
  [108, 116],
  [212, 122],
  [206, 208],
  [114, 206],
];

/** 색을 어둡게 섞어 그림자·윤곽에 쓴다 */
function shade(color: string, amount: number): string {
  return `color-mix(in srgb, ${color} ${100 - amount}%, #2a1608)`;
}

function ToppingArt({ kind, x, y }: { kind: Topping; x: number; y: number }) {
  const at = `translate(${x} ${y})`;
  switch (kind) {
    case 'egg':
      return (
        <g transform={`${at} rotate(-18)`}>
          <ellipse rx="27" ry="21" fill="#fffaf0" />
          <circle cx="2" cy="1" r="11" fill="#f2b632" />
          <circle cx="-1" cy="-2" r="3.5" fill="#f8d470" />
        </g>
      );
    case 'scallion':
      return (
        <g transform={at} fill="none" stroke="#5c9a4a" strokeWidth="3.5">
          <circle cx="-14" cy="-6" r="5" />
          <circle cx="2" cy="-14" r="5.5" stroke="#7bb661" />
          <circle cx="14" cy="-2" r="5" />
          <circle cx="-4" cy="6" r="5.5" stroke="#7bb661" />
          <circle cx="10" cy="14" r="4.5" />
          <circle cx="-16" cy="12" r="4.5" stroke="#8fc477" />
        </g>
      );
    case 'gim':
      return (
        <g transform={`${at} rotate(24)`} fill="#1f2a22">
          <rect x="-16" y="-15" width="4.5" height="30" rx="1" />
          <rect x="-8" y="-12" width="4.5" height="27" rx="1" transform="rotate(8)" />
          <rect x="0" y="-16" width="4.5" height="30" rx="1" transform="rotate(-6)" />
          <rect x="8" y="-13" width="4.5" height="28" rx="1" transform="rotate(10)" />
          <rect x="15" y="-14" width="4.5" height="26" rx="1" transform="rotate(-4)" />
        </g>
      );
    case 'chili':
      return (
        <g transform={at} fill="#d43a2a">
          <ellipse cx="-12" cy="-8" rx="7" ry="3.5" transform="rotate(-30 -12 -8)" />
          <ellipse cx="6" cy="-12" rx="7" ry="3.5" transform="rotate(20 6 -12)" />
          <ellipse cx="12" cy="4" rx="7" ry="3.5" transform="rotate(-50 12 4)" />
          <ellipse cx="-6" cy="8" rx="7" ry="3.5" transform="rotate(40 -6 8)" />
          <ellipse cx="4" cy="16" rx="6" ry="3" fill="#4f8f3f" transform="rotate(-10 4 16)" />
        </g>
      );
    case 'cucumber':
      return (
        <g transform={`${at} rotate(-32)`} stroke="#a9cf86" strokeWidth="4" strokeLinecap="round">
          <line x1="-20" y1="-12" x2="20" y2="-10" />
          <line x1="-22" y1="-5" x2="18" y2="-4" stroke="#c4dfa3" />
          <line x1="-18" y1="2" x2="22" y2="2" />
          <line x1="-21" y1="9" x2="19" y2="8" stroke="#8fbd6c" />
          <line x1="-17" y1="15" x2="21" y2="15" stroke="#c4dfa3" />
        </g>
      );
    case 'kimchi':
      return (
        <g transform={at}>
          <path d="M-22-6c6-10 20-12 28-4s6 18-4 20-20 2-24-4-2-8 0-12z" fill="#d9532f" />
          <path d="M-12-2c4-5 12-6 17-1s3 9-3 10-11 1-14-2-1-5 0-7z" fill="#ef8a5a" />
          <path d="M8 10c4-3 11-2 13 3s-2 9-8 9-9-4-8-7 1-4 3-5z" fill="#c9432a" />
        </g>
      );
    case 'sesame':
      return (
        <g transform={at} fill="#f3e3b3" stroke="#b99a5a" strokeWidth="0.8">
          {[
            [-16, -10],
            [-4, -16],
            [10, -12],
            [18, 0],
            [-12, 4],
            [2, -2],
            [12, 10],
            [-4, 14],
            [-20, 14],
            [22, -14],
          ].map(([sx, sy]) => (
            <ellipse key={`${sx}-${sy}`} cx={sx} cy={sy} rx="2.6" ry="1.7" transform={`rotate(${sx * 7} ${sx} ${sy})`} />
          ))}
        </g>
      );
    case 'zucchini':
      return (
        <g transform={at}>
          {[
            [-12, -8, -20],
            [10, -10, 30],
            [-4, 10, 80],
          ].map(([zx, zy, rot]) => (
            <g key={`${zx}-${zy}`} transform={`translate(${zx} ${zy}) rotate(${rot})`}>
              <path d="M-13 0a13 13 0 0 1 26 0z" fill="#e7efc4" stroke="#5f9a4c" strokeWidth="3" strokeLinejoin="round" />
            </g>
          ))}
        </g>
      );
    case 'fishcake':
      return (
        <g transform={at}>
          <circle r="20" fill="#fff7f1" stroke="#f1d9cf" strokeWidth="2" />
          <path
            d="M0 0c4-4 10 0 8 6s-12 8-16 2-2-16 8-18 20 6 16 18"
            fill="none"
            stroke="#e9728c"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      );
    case 'ice':
      return (
        <g transform={at} fill="#ffffff" fillOpacity="0.55" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="1.5">
          <rect x="-20" y="-14" width="18" height="18" rx="4" transform="rotate(-12 -11 -5)" />
          <rect x="2" y="-6" width="20" height="20" rx="4" transform="rotate(18 12 4)" />
          <rect x="-12" y="8" width="15" height="15" rx="3" transform="rotate(6 -4 15)" />
        </g>
      );
    case 'sauce':
      return (
        <g transform={at}>
          <path d="M-34-8c8-22 44-26 58-8s8 40-14 44-40 0-48-12-2-16 4-24z" fill="#c23a22" />
          <path d="M-20-6c6-12 28-14 36-4s4 22-8 24-24 0-28-6-2-9 0-14z" fill="#d9532f" />
        </g>
      );
  }
}

/** 위에서 내려다본 국수 한 그릇. 국물·면 색과 고명을 메뉴마다 다르게 그린다. */
export function Bowl({ spec, label, className }: BowlProps) {
  const clipId = useId();
  const noodleShade = shade(spec.noodle, 28);
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="160" cy="160" r="118" />
        </clipPath>
      </defs>
      {/* 그릇 */}
      <circle cx="160" cy="160" r="152" fill="#e9e1d0" />
      <circle cx="160" cy="160" r="146" fill="#fbf7ee" />
      <circle cx="160" cy="160" r="124" fill={shade(spec.broth, 22)} />
      <circle cx="160" cy="160" r="118" fill={spec.broth} />
      <g clipPath={`url(#${clipId})`}>
        {/* 국물의 윤기 */}
        <ellipse cx="112" cy="104" rx="52" ry="26" fill="#ffffff" fillOpacity="0.14" transform="rotate(-32 112 104)" />
        {/* 면 — 어두운 선 위에 밝은 선을 겹쳐 가닥의 두께를 낸다 */}
        <g fill="none" strokeLinecap="round">
          {STRANDS.map(([cx, cy, r, length, offset]) => (
            <circle
              key={`s-${cx}-${cy}-${r}`}
              cx={cx}
              cy={cy}
              r={r}
              stroke={noodleShade}
              strokeWidth="9"
              strokeDasharray={`${length} 999`}
              strokeDashoffset={-offset}
            />
          ))}
          {STRANDS.map(([cx, cy, r, length, offset]) => (
            <circle
              key={`l-${cx}-${cy}-${r}`}
              cx={cx}
              cy={cy}
              r={r}
              stroke={spec.noodle}
              strokeWidth="6"
              strokeDasharray={`${length} 999`}
              strokeDashoffset={-offset}
            />
          ))}
        </g>
        {spec.toppings.map((kind, index) => {
          const [x, y] = SPOTS[index % SPOTS.length];
          return <ToppingArt key={kind} kind={kind} x={x} y={y} />;
        })}
      </g>
    </svg>
  );
}
