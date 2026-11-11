# 국수집 (GuksuJip)

국숫집 차림표에서 메뉴를 고르면 프로젝트가 한 그릇씩 나오는 포트폴리오 사이트입니다.

**[→ 사이트 열기](https://guksu.github.io/GuksuJip/)**

## 화면 흐름

1. 첫 화면은 국숫집 벽에 걸린 차림표입니다. 팻말 하나가 프로젝트 하나입니다.
2. 팻말을 누르면 주문서에 도장이 찍혀 주방으로 넘어가고, 그릇이 상 위에 놓입니다.
3. 그릇 옆에 그 프로젝트의 소개(한 줄 소개, 맛 포인트, 재료, 링크)가 펼쳐집니다.

프로젝트마다 주소가 있어서 `…/GuksuJip/#/menu/suta`처럼 바로 공유할 수 있습니다. 주소로 바로 들어오거나 기기에서 "동작 줄이기"를 켠 경우에는 애니메이션 없이 소개부터 보여 줍니다.

## 메뉴 고치기

| 고칠 것 | 파일 |
|---|---|
| 프로젝트 추가·수정(이름, 소개, 맛 포인트, 재료, 링크, 그릇 색과 고명) | `src/data/menu.ts` |
| 가게 정보(이름, 한 줄 소개, 깃허브, 이메일) | `src/data/owner.ts` |
| 색·글꼴·간격 | `src/styles/tokens.css` |

`menu.ts`에 항목을 추가하면 차림표와 소개 화면에 함께 나옵니다. 그릇은 `bowl`의 국물 색(`broth`), 면 색(`noodle`), 고명(`toppings`)으로 정합니다.

## 개발

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run dev        # http://localhost:5290/GuksuJip/
npm test           # 메뉴 데이터와 주소 규칙 검사
npm run build      # 타입 검사 후 dist/에 빌드
```

## 구조

```
src/
├ App.tsx                 차림표와 소개 화면 전환, 주소 연결
├ data/menu.ts            메뉴(프로젝트) 데이터
├ data/owner.ts           가게 정보
├ hooks/useHashRoute.ts   #/menu/{이름} 주소 읽기·쓰기
├ components/
│ ├ MenuBoard.tsx         벽 차림표
│ ├ MenuPlank.tsx         팻말 하나
│ ├ OrderScene.tsx        주문서 → 그릇 → 소개로 이어지는 장면
│ ├ Bowl.tsx              국수 그릇 그림(SVG)
│ └ ProjectSheet.tsx      프로젝트 소개
└ styles/                 색·글꼴·간격 변수와 기본 스타일
```

Vite, React, TypeScript, CSS Modules로 만들었고 장면 전환에는 [Motion](https://motion.dev)을 썼습니다. 글꼴은 Pretendard와 도현체입니다.

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 테스트와 빌드를 거쳐 GitHub Pages에 올립니다. 저장소 이름을 바꾸면 `vite.config.ts`의 `base`도 함께 바꿔야 합니다.
