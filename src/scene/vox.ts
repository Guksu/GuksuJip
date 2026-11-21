import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** 상자를 쌓아 하나의 메시로 묶는다. 색은 꼭짓점 색으로 넣는다. */
export class Vox {
  private geos: THREE.BufferGeometry[] = [];

  /** 범위로 상자 하나를 놓는다 */
  b(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string): this {
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    const d = Math.abs(z1 - z0);
    const geo = new THREE.BoxGeometry(w, h, d);
    geo.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const c = new THREE.Color(color);
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geos.push(geo);
    return this;
  }

  /** 중심과 크기로 상자 하나를 놓는다 */
  c(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: string): this {
    return this.b(cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, cz - d / 2, cz + d / 2, color);
  }

  /** x 방향으로 널빤지를 나란히 놓는다. 널마다 색을 조금씩 달리한다 */
  planksX(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, step: number, color: string, seed = 1): this {
    let i = 0;
    for (let x = x0; x < x1 - 1e-6; x += step) {
      this.b(x, Math.min(x + step, x1) - 0.02, y0, y1, z0, z1, jitter(color, seed + i++));
    }
    return this;
  }

  /** z 방향으로 널빤지를 나란히 놓는다 */
  planksZ(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, step: number, color: string, seed = 1): this {
    let i = 0;
    for (let z = z0; z < z1 - 1e-6; z += step) {
      this.b(x0, x1, y0, y1, z, Math.min(z + step, z1) - 0.02, jitter(color, seed + i++));
    }
    return this;
  }

  mesh(material?: THREE.Material): THREE.Mesh {
    const geo = mergeGeometries(this.geos, false)!;
    this.geos.forEach((g) => g.dispose());
    this.geos = [];
    return new THREE.Mesh(geo, material ?? LIT);
  }
}

export const LIT = new THREE.MeshLambertMaterial({ vertexColors: true });
/** 빛을 받지 않고 제 색 그대로 보이는 것(등, 창호지) */
export const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true });

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** 같은 색을 조금 밝게·어둡게 흔든다 */
export function jitter(color: string, seed: number, amount = 0.06): string {
  const c = new THREE.Color(color);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + (rand(seed) - 0.5) * 2 * amount)));
  return `#${c.getHexString()}`;
}

/** 글자를 그린 낮은 해상도 텍스처 */
export function textTexture(
  text: string,
  w: number,
  h: number,
  opts: { bg?: string; fg: string; size: number; font?: string; vertical?: boolean },
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle = opts.fg;
  ctx.font = `${opts.size}px ${opts.font ?? 'Galmuri11'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (opts.vertical) {
    const chars = [...text];
    const step = h / chars.length;
    chars.forEach((ch, i) => ctx.fillText(ch, w / 2, step * (i + 0.5) + 1));
  } else {
    ctx.fillText(text, w / 2, h / 2 + 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function textPlane(tex: THREE.Texture, w: number, h: number, lit = false): THREE.Mesh {
  const mat = lit
    ? new THREE.MeshLambertMaterial({ map: tex, transparent: true })
    : new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
