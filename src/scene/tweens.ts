export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const linear = (x: number) => x;

interface Running {
  t: number;
  d: number;
  fn: (k: number) => void;
  ease: (x: number) => number;
  done: () => void;
}

/** 장면 하나가 쓰는 움직임 목록. 매 프레임 step으로 시간을 흘려 준다. */
export class Tweens {
  /** 1보다 크면 그만큼 빨리 감는다(연출 건너뛰기) */
  scale = 1;
  private list: Running[] = [];

  /** seconds 동안 fn(0→1)을 부른다. 0초면 바로 끝낸다 */
  run(seconds: number, fn: (k: number) => void, ease: (x: number) => number = easeOut): Promise<void> {
    return new Promise((resolve) => {
      if (seconds <= 0) {
        fn(1);
        resolve();
        return;
      }
      this.list.push({ t: 0, d: seconds, fn, ease, done: resolve });
    });
  }

  wait(seconds: number): Promise<void> {
    return this.run(seconds, () => {}, linear);
  }

  step(dt: number): void {
    const scaled = dt * this.scale;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const r = this.list[i];
      r.t += scaled;
      const k = Math.min(1, r.t / r.d);
      r.fn(r.ease(k));
      if (k >= 1) {
        this.list.splice(i, 1);
        r.done();
      }
    }
  }

  clear(): void {
    this.list = [];
  }
}
