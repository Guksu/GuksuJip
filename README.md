# 국수집 (GuksuJip)

국숫집 상에 앉아 차림표를 펼치고, 메뉴를 고르면 프로젝트가 한 그릇씩 나오는 포트폴리오 사이트입니다.

**[→ 사이트 열기](https://guksu.github.io/GuksuJip/)**

## 화면 흐름

1. 첫 화면은 빈 상입니다. 덮인 차림표 한 권과 수저만 놓여 있습니다.
2. 차림표를 누르면 표지가 책처럼 넘어가고, 책이 왼쪽으로 비켜나 오른쪽에 상 차릴 자리가 생깁니다.
3. 차림표의 줄을 누르면 그 메뉴의 그릇이 커지면서 소개 화면으로 넘어갑니다. 상 위에는 그릇과 주문서(종류·재료)가 놓이고, 옆에는 제품 화면이 들어간 소개가 펼쳐집니다.
4. 차림표로 돌아오면 주문했던 그릇이 상에 남아 있습니다. 둘러볼수록 상이 차려집니다.
5. 한 그릇이라도 주문하면 상 구석에 계산서가 놓입니다. 펼치면 맛본 메뉴가 적혀 있고 연락처로 이어집니다.

메뉴마다 주소가 있어서 `…/GuksuJip/#/menu/suta`처럼 바로 공유할 수 있습니다. 주문한 그릇은 브라우저(localStorage)에 저장해서 다시 들어와도 상이 그대로입니다.

## 구현하면서 신경 쓴 것

- **전환**: 애니메이션 라이브러리 없이 브라우저의 View Transitions로 화면을 바꿉니다. 고른 그릇에 `view-transition-name`을 붙여서, 차림표 옆의 작은 그릇이 소개 화면의 큰 그릇으로 자리를 옮기듯 이어집니다. 뒤로 가기에도 같은 전환이 일어납니다.
- **표지 넘기기**: 표지의 앞면과 안쪽 면을 `rotateY`와 `backface-visibility`로 겹쳐 놓고 왼쪽 모서리를 축으로 돌립니다.
- **좁은 화면**: 책을 펼칠 자리가 없어서 차림표, 상(그릇 격자), 인사말을 위에서 아래로 놓습니다. 320px 폭까지 가로로 넘치지 않습니다.
- **키보드와 스크린 리더**: 차림표 줄과 상 위의 그릇은 모두 버튼이고, 소개 화면에서 Esc를 누르면 차림표로 돌아와 보던 줄로 포커스가 돌아갑니다. 가려진 면은 `inert`로 막고, 계산서는 `<dialog>`를 씁니다.
- **동작 줄이기**: 기기에서 동작 줄이기를 켜면 전환과 표지 넘기기 없이 바로 바뀝니다.

## 메뉴 고치기

| 고칠 것 | 파일 |
|---|---|
| 프로젝트 추가·수정(이름, 소개, 맛 포인트, 재료, 링크, 그릇 색과 고명) | `src/data/menu.ts` |
| 제품 화면 이미지 | `src/assets/shots/{메뉴}/`에 넣고 `src/data/shots.ts`에 등록 |
| 주인장 정보(이름, 한 줄 소개, 깃허브, 이메일) | `src/data/owner.ts` |
| 색·글꼴·간격 | `src/styles/tokens.css` |

메뉴를 13개보다 늘리면 상 위에 그릇 놓을 자리(`src/components/Spread.tsx`의 `SLOTS`)도 함께 늘려야 합니다.

제품 화면은 세 가지에서 가져왔습니다. 앱은 스토어 소개 이미지, 웹은 실제 사이트를 캡처한 화면, 나머지는 각 저장소 README의 이미지입니다. 화면이 없는 CLI와 스킬은 README에 있는 터미널 출력을 글자로 넣었습니다.

## 개발

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run dev        # http://localhost:5290/GuksuJip/
npm test           # 메뉴 데이터, 주소 규칙, 주문 기록 검사
npm run build      # 타입 검사 후 dist/에 빌드
```

## 구조

```
src/
├ App.tsx                  차림표와 소개 화면 전환, 주문 기록 연결
├ data/menu.ts             메뉴(프로젝트) 데이터
├ data/shots.ts            제품 화면 목록
├ data/owner.ts            주인장 정보
├ hooks/useHashRoute.ts    #/menu/{이름} 주소와 화면 전환
├ hooks/useOrdered.ts      주문한 메뉴를 브라우저에 저장
├ lib/viewTransition.ts    View Transition으로 화면 바꾸기
├ components/
│ ├ Home.tsx               첫 화면(상)
│ ├ MenuBook.tsx           차림표 한 권(표지, 안쪽 면, 차림표 면)
│ ├ Spread.tsx             차려진 상(주문한 그릇, 계산서 쪽지)
│ ├ CheckDialog.tsx        계산서
│ ├ ProjectDetail.tsx      소개 화면(그릇, 주문서, 소개 종이)
│ ├ ProjectSheet.tsx       소개 종이의 내용
│ ├ Shots.tsx              제품 화면과 터미널 출력
│ └ Bowl.tsx               국수 그릇 그림(SVG)
└ styles/                  색·글꼴·간격 변수와 기본 스타일
```

Vite, React, TypeScript, CSS Modules로 만들었습니다. 글꼴은 Pretendard와 도현체입니다.

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 테스트와 빌드를 거쳐 GitHub Pages에 올립니다. 저장소 이름을 바꾸면 `vite.config.ts`의 `base`도 함께 바꿔야 합니다.
