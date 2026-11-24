import { useEffect, useRef } from 'react';
import type { BowlSpec } from '../data/menu';
import { makeBowl } from '../pixel/sprites';

interface BowlIconProps {
  spec: BowlSpec;
  /** 그릇 입의 반지름(그림 칸). 클수록 고명이 자세히 보인다 */
  radius: number;
  /** 그림 한 칸을 화면의 몇 px로 그릴지 */
  scale: number;
  className?: string;
}

/** 국수 그릇 그림. 장면과 같은 그림 코드로 그려서 차림과 가게의 그릇이 똑같다. */
export function BowlIcon({ spec, radius, scale, className }: BowlIconProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const sprite = makeBowl(spec, radius, '#2f3f7a');
    canvas.width = sprite.img.width;
    canvas.height = sprite.img.height;
    canvas.style.width = `${sprite.img.width * scale}px`;
    canvas.getContext('2d')?.drawImage(sprite.img, 0, 0);
  }, [spec, radius, scale]);

  return <canvas ref={ref} className={className} style={{ imageRendering: 'pixelated' }} aria-hidden="true" />;
}
