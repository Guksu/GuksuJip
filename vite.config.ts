import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages는 https://guksu.github.io/GuksuJip/ 아래에 올라가므로 base를 저장소 이름으로 둔다.
export default defineConfig({
  base: '/GuksuJip/',
  plugins: [react()],
  // 글꼴 조각 파일이 CSS 안에 base64로 들어가지 않게 한다(조각은 필요한 글자만 내려받는다).
  build: { assetsInlineLimit: 0 },
  server: { port: 5290 },
  test: { environment: 'node' },
});
