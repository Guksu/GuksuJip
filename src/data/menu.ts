export type CategoryId = 'ai' | 'library' | 'web' | 'app';

export interface Category {
  id: CategoryId;
  title: string;
}

export interface MenuLink {
  label: string;
  href: string;
}

/** 그릇에 올리는 고명 종류. Bowl.tsx가 이 이름대로 그린다. */
export type Topping =
  | 'egg'
  | 'scallion'
  | 'gim'
  | 'chili'
  | 'cucumber'
  | 'kimchi'
  | 'sesame'
  | 'zucchini'
  | 'fishcake'
  | 'ice'
  | 'sauce';

export interface BowlSpec {
  /** 국물 색 */
  broth: string;
  /** 면 색 */
  noodle: string;
  toppings: Topping[];
}

export interface MenuItem {
  /** 주소에 쓰는 이름. #/menu/{slug} */
  slug: string;
  name: string;
  /** 무엇인지 한 낱말로. 팻말 오른쪽 붉은 글씨 */
  kind: string;
  category: CategoryId;
  /** 팻말에 적는 한 줄 */
  tagline: string;
  intro: string;
  /** 주요 기능과 구현 내용 */
  points: string[];
  /** 재료 — 기술 스택 */
  stack: string[];
  /** 첫 번째 링크가 주 버튼이 된다 */
  links: MenuLink[];
  /** 저장소가 비공개인지 */
  privateRepo?: boolean;
  /** 제품 화면 대신 보여 줄 글자 자료(터미널 출력, 다듬기 전후 문장). README에 있는 내용만 쓴다 */
  exhibit?: { text: string; caption: string };
  /** 제품 화면에 덧붙일 한 줄 */
  shotNote?: string;
  /** 이 프로젝트를 담아 내는 국수 이름 */
  dish: string;
  bowl: BowlSpec;
}

export const categories: Category[] = [
  { id: 'ai', title: 'AI 도구·스킬' },
  { id: 'library', title: '라이브러리' },
  { id: 'web', title: '웹·확장 프로그램' },
  { id: 'app', title: '모바일 앱' },
];

const repo = (name: string): MenuLink => ({ label: '저장소', href: `https://github.com/Guksu/${name}` });

export const menu: MenuItem[] = [
  {
    slug: 'suta',
    name: 'suta',
    kind: '스킬',
    category: 'ai',
    tagline: 'AI가 반복하는 UI 패턴을 줄이는 스킬',
    intro:
      'Claude Code·Codex에 UI 작성 기준과 구현 예제를 제공해요. 획일적인 화면 구성과 불필요한 효과를 줄이고, 키보드 조작·모바일 화면·접근성을 함께 살펴요.',
    points: [
      '키보드 조작, 대화상자의 포커스 이동, 320~390px 화면의 가로 넘침, 글자 대비, 동작 줄이기 설정을 점검해요.',
      '모달·바텀시트·토스트·드롭다운 등 UI 패턴 57종을 제공해요. 각 패턴은 외부 의존성이 없는 TypeScript 코어, React 래퍼, CSS로 구성돼요.',
      '파일 수정 후 검사로 11px 미만 글자와 레이아웃 속성 애니메이션 등을 찾아요.',
      '0.14 버전 자체 비교에서 접근성 위반이 16건에서 1건으로 줄었어요. 4종 화면을 조건별 2회 생성하고 axe로 390px 화면을 검사한 결과예요.',
    ],
    stack: ['TypeScript', 'React', 'CSS', 'Claude Code·Codex 플러그인'],
    links: [{ label: '데모 보기', href: 'https://guksu.github.io/suta/' }, repo('suta')],
    dish: '수타 칼국수',
    bowl: { broth: '#e6d6ad', noodle: '#f6ecd0', toppings: ['zucchini', 'scallion', 'gim'] },
  },
  {
    slug: 'gimi',
    name: 'gimi',
    kind: '스킬',
    category: 'ai',
    tagline: '사용처와 변경 이력까지 확인하는 코드 리뷰',
    intro:
      '변경한 코드가 다른 곳에 미치는 영향을 살피는 Claude Code·Codex용 리뷰 스킬이에요. 관련 코드와 요구사항을 먼저 모으고, 문제가 생기는 조건과 근거를 함께 남겨요.',
    points: [
      '변경한 함수·타입·문자열을 쓰는 코드를 찾아 영향 범위를 확인해요.',
      'PR·이슈의 요구사항과 PR 설명이 실제 변경에 반영됐는지 대조해요.',
      '커밋 이력과 CI 결과를 확인하고, 이전 버그 수정이 되돌아가는지 살펴요.',
      '문제가 생기는 입력·상황과 근거 코드의 위치를 설명할 수 있는 지적만 남겨요.',
    ],
    stack: ['JavaScript', 'Claude Code·Codex 스킬'],
    links: [repo('gimi')],
    exhibit: {
      caption: '리뷰 결과 예시',
      text: `[고쳐야 함] 영향 범위
주문 상태 형태가 바뀌었는데 배지는 예전 형태를 읽는다

바뀐 곳  src/api/order.ts:42
         status: string → { code, label }
근거     src/components/OrderBadge.tsx:12
         status === 'PAID'  (이 PR에서 안 바뀜)
상황     결제 완료 주문 → 배지가 항상 '알 수 없음'
생긴 때  이번 변경`,
    },
    dish: '잔치국수',
    bowl: { broth: '#dcc588', noodle: '#f8f1dc', toppings: ['egg', 'scallion', 'gim'] },
  },
  {
    slug: 'guksu-harness',
    name: 'guksu-harness',
    kind: '하네스',
    category: 'ai',
    tagline: 'AI 코딩 에이전트의 작업 규칙과 훅 관리',
    intro:
      'Claude Code·Codex가 작업할 때 참고할 팀 규칙과 실행을 제한하는 훅을 설치해요. 프로젝트에 맞게 설정하고, 업데이트할 때 팀이 수정한 내용을 보존해요.',
    points: [
      '훅에서 보호 브랜치 편집, 민감정보 파일 접근, reset·push --force 같은 Git 명령을 검사해 차단해요.',
      '핵심 규칙 네 줄은 CLAUDE.md·AGENTS.md에 두고, 상세 규칙은 별도 문서로 연결해요.',
      '저장소를 분석해 설정을 제안하고, 코드만으로 알 수 없는 팀의 결정은 질문해요.',
      '업데이트할 때 기존 설정과 규칙을 덮어쓰지 않아요.',
    ],
    stack: ['JavaScript', 'Node.js 22', 'Claude Code·Codex 훅'],
    links: [repo('guksu-harness'), { label: 'npm', href: 'https://www.npmjs.com/package/guksu-harness' }],
    exhibit: {
      caption: '설치와 점검',
      text: `$ npx guksu-harness init --app both   # 훅·규칙·앱 등록 설치
$ npx guksu-harness check             # 설치 상태 검사`,
    },
    dish: '우동',
    bowl: { broth: '#a97a40', noodle: '#f4e8c8', toppings: ['fishcake', 'scallion', 'gim'] },
  },
  {
    slug: 'geulppal',
    name: '글빨',
    kind: '스킬',
    category: 'ai',
    tagline: 'Claude의 한국어 문장에서 번역투를 덜어내는 스킬',
    intro:
      '영어를 그대로 옮긴 표현이나 명사만 나열한 문장을 자연스러운 한국어로 다듬어요. 원문의 사실과 의미는 유지해요.',
    points: [
      '문맥에 맞지 않는 번역투를 고쳐요. 예를 들어 “조용히 버려집니다”를 “오류 없이 버려집니다”로 바꿔요.',
      '설명 없이 쓴 용어와 화살표로 생략한 관계를 문장으로 풀어요.',
      '원문에 없는 사실은 보태지 않고, 확인이 필요한 부분은 따로 알려요.',
    ],
    stack: ['Claude 스킬', 'JavaScript'],
    links: [repo('geulppal')],
    exhibit: {
      caption: '문장 수정 예시: 전(−) / 후(+)',
      text: `− 마지막 단어 뒤에 넣을 insert 패치는 조용히 버려집니다.
+ 마지막 단어 뒤에 넣을 insert 패치는 오류 없이 버려집니다.

− 값이 외부에서 바뀌거나 오염되면 타입이 거짓이 됩니다.
+ 값이 외부에서 바뀌거나 오염되면 타입이 실제 값과 맞지 않게 됩니다.

− 구조를 바꾸면 조용히 틀린 결과가 나올 수 있습니다.
+ 구조를 바꾸면 오류 없이 틀린 결과가 나올 수 있습니다.`,
    },
    dish: '콩국수',
    bowl: { broth: '#f2ecdb', noodle: '#ecdcae', toppings: ['cucumber', 'sesame'] },
  },
  {
    slug: 'tokkaebi',
    name: 'tokkaebi',
    kind: 'CLI',
    category: 'ai',
    tagline: 'Claude Code 사용량과 비용을 보는 CLI',
    intro:
      '컴퓨터에 남은 Claude Code 사용 기록을 읽어 토큰 사용량과 비용을 집계해요. 날짜·모델·프로젝트별 사용량과 캐시로 절감한 비용을 터미널에서 확인할 수 있어요.',
    points: [
      '서버나 로그인 없이 로컬에서 실행해요.',
      '설치 전 기록도 집계하고, 중복된 응답 기록은 걸러내요.',
      '캐시 종류별 단가를 반영해 비용을 계산해요.',
      '요일·시간대별 히트맵, 주간 추이, 월 예산, 월간·연간 결산을 제공해요.',
    ],
    stack: ['TypeScript', 'Node.js CLI'],
    links: [repo('tokkaebi'), { label: 'npm', href: 'https://www.npmjs.com/package/tokkaebi' }],
    exhibit: {
      caption: 'tokkaebi today 출력(일부)',
      text: `$ tokkaebi today
✔ 파일 269개 확인 · +16건 수집 (0.0초)

오늘 사용량 · 2026-08-11 (화) · $87.27

모델            입력    출력      캐시 읽기    비용
claude-fable-5  2,316   316,010   44,645,376   $86.88
claude-opus-5      28        35      329,533    $0.40

캐시 절감  $390.21 — 캐시가 없었다면 오늘 $477.48
연속 사용  2일째`,
    },
    dish: '짬뽕',
    bowl: { broth: '#c5492c', noodle: '#f3dfae', toppings: ['scallion', 'chili', 'zucchini'] },
  },
  {
    slug: 'qa-recorder',
    name: 'qa-recorder',
    kind: '라이브러리',
    category: 'library',
    tagline: '버그 재현에 필요한 기록을 HTML 파일 하나로',
    intro:
      '웹 앱에서 오류가 발생한 과정을 공유하는 QA 라이브러리예요. rrweb으로 기록한 화면 변화와 네트워크 요청·콘솔 에러를 HTML 리포트로 묶어요. 백엔드나 브라우저 확장 없이 앱에 붙여 쓸 수 있어요.',
    points: [
      '화면 공유 권한 없이 DOM 변화를 기록하고 재생해요. 모바일·WebView에서도 사용할 수 있어요.',
      '최근 fetch·XHR 요청 100건을 모아 HAR 1.2 파일로 내보내요.',
      '리포트의 네트워크 요청이나 콘솔 항목을 누르면 해당 시점의 화면으로 이동해요.',
      '비밀번호·토큰 등 민감한 값을 저장 전에 마스킹해요.',
    ],
    stack: ['TypeScript', 'rrweb', 'Shadow DOM', 'npm 패키지'],
    links: [
      { label: '데모 보기', href: 'https://guksu.github.io/qa-recorder/' },
      repo('qa-recorder'),
      { label: 'npm', href: 'https://www.npmjs.com/package/qa-recorder' },
    ],
    dish: '물냉면',
    bowl: { broth: '#d5d9c4', noodle: '#8c765b', toppings: ['egg', 'cucumber', 'ice'] },
  },
  {
    slug: 'foldlab',
    name: 'FoldLab',
    kind: '디버거',
    category: 'web',
    tagline: '폴더블 화면의 접힘 상태별 레이아웃 검사',
    intro:
      '폴더블·플립·듀얼 스크린 환경을 재현하는 웹 디버거예요. URL을 입력하면 Chromium에서 접힘·펼침·반 접힘·화면 분할 상태를 확인할 수 있어요.',
    points: [
      '기기 프레임 안의 웹사이트를 클릭·드래그·키보드로 조작할 수 있어요.',
      '화면 상태가 바뀔 때마다 24개 규칙으로 검사하고, 문제가 있는 요소와 수정 방법을 표시해요.',
      '여러 화면 상태를 한 장에 모아 캡처하고, PNG·Markdown으로 PR에 첨부할 수 있어요.',
      '로컬에서 실행하므로 localhost 개발 서버도 검사할 수 있어요.',
    ],
    stack: ['TypeScript', 'React', 'Playwright', 'Express'],
    links: [repo('FoldLab')],
    dish: '메밀 막국수',
    bowl: { broth: '#b9966a', noodle: '#7e6a54', toppings: ['gim', 'scallion', 'sesame'] },
  },
  {
    slug: 'noodlelens',
    name: 'NoodleLens',
    kind: 'Chrome 확장',
    category: 'web',
    tagline: '웹 요소를 선택해 AI에 묻는 레이아웃 디버거',
    intro:
      '웹페이지의 레이아웃·스타일 문제를 GPT·Claude에 묻는 Chrome 확장 프로그램이에요. 선택한 요소의 DOM, 적용된 스타일, 크기 측정값을 질문과 함께 보내요.',
    points: [
      '가로 넘침, 말줄임 조건, flex·grid 크기 문제는 모델 호출 전에 코드로 검사해요.',
      '답변의 근거 번호를 누르면 해당 요소가 페이지에서 강조돼요.',
      '전송할 내용을 미리 확인하고, 제외할 항목을 선택할 수 있어요.',
      '사용자의 API 키로 모델 API를 직접 호출해요. 중간 서버를 거치지 않아요.',
    ],
    stack: ['TypeScript', 'React', 'Chrome 사이드 패널', 'OpenAI·Anthropic API'],
    links: [repo('NoodleLens')],
    shotNote: '이 화면의 답변은 설명을 위해 만든 예시예요. 실제 모델 응답이 아니에요.',
    dish: '비빔국수',
    bowl: { broth: '#ead9ae', noodle: '#f4e6c2', toppings: ['sauce', 'cucumber', 'egg', 'sesame'] },
  },
  {
    slug: 'builbook',
    name: 'builbook',
    kind: '웹 앱',
    category: 'web',
    tagline: '회차와 설정을 함께 관리하는 웹소설 에디터',
    intro:
      '스크리브너를 참고해 만든 웹소설 집필 도구예요. 회차별 원고와 인물·설정을 한곳에 두고 쓸 수 있어요. 로그인 없이 데이터는 브라우저에 저장해요.',
    points: [
      '문서 트리에서 회차를 만들고 순서를 바꿔요. 폴더를 선택하면 여러 회차를 이어서 쓸 수 있어요.',
      '입력을 멈추면 자동 저장하고, 저장 실패 시 백업을 남겨요.',
      '회차별 분량, 연속 집필일, 고유명사 사전, 인물 관계도를 관리해요.',
      'TXT·Markdown·DOCX로 내보낼 수 있고, 오프라인에서도 사용할 수 있어요.',
    ],
    stack: ['Next.js 15', 'React 19', 'IndexedDB', 'Tiptap', 'Tailwind CSS', 'Vitest', 'Playwright'],
    links: [{ label: '써 보기', href: 'https://builbook.vercel.app' }, repo('builbook')],
    dish: '짜장면',
    bowl: { broth: '#3d2b1e', noodle: '#e9d49c', toppings: ['cucumber'] },
  },
  {
    slug: 'video-encoder',
    name: 'video-encoder',
    kind: '웹 앱',
    category: 'web',
    tagline: '서버에 올리지 않고 브라우저에서 영상 압축',
    intro:
      '영상 파일을 기기 밖으로 보내지 않고 압축하는 웹 앱이에요. WebCodecs를 우선 사용하고, 지원하지 않는 환경에서는 FFmpeg.wasm으로 전환해요.',
    points: [
      '품질과 해상도를 조절하고 오디오를 제거할 수 있어요.',
      '압축 전후 용량과 감소 비율을 확인해요.',
      '압축한 파일을 바로 내려받을 수 있어요.',
    ],
    stack: ['Vite', 'TypeScript', 'WebCodecs', 'FFmpeg.wasm', 'mp4box.js', 'mp4-muxer'],
    links: [repo('video-encoder')],
    dish: '쌀국수',
    bowl: { broth: '#d9ba7c', noodle: '#fbf6e6', toppings: ['scallion', 'chili', 'sesame'] },
  },
  {
    slug: 'muklog',
    name: '먹로그',
    kind: 'iOS 앱',
    category: 'app',
    tagline: '함께 다녀온 맛집을 모으는 기록 앱',
    intro:
      '연인이나 친구와 맛집 기록을 공유해요. 초대코드로 같은 공간에 참여하고, 다녀온 곳의 사진·별점·메모를 지도에 남길 수 있어요.',
    points: [
      '공유 공간인 “로그”를 여러 개 만들 수 있어요. 로그 하나에 최대 5명이 참여해요.',
      '장소를 검색해 주소와 좌표를 불러오고, 사진 최대 5장과 별점·메모를 남겨요.',
      '기록한 맛집, 주변 음식점, 가 보고 싶은 곳을 지도에서 확인해요.',
      '위시리스트의 음식점은 방문 후 기록으로 바꿀 수 있어요.',
    ],
    stack: ['React Native(Expo)', 'TypeScript', 'Supabase', 'Kakao Map', 'TanStack Query'],
    links: [
      {
        label: 'App Store',
        href: 'https://apps.apple.com/kr/app/%EB%A8%B9%EB%A1%9C%EA%B7%B8-muklog/id6782955594',
      },
    ],
    privateRepo: true,
    dish: '들깨칼국수',
    bowl: { broth: '#d6c69d', noodle: '#f5ead0', toppings: ['zucchini', 'sesame', 'gim'] },
  },
  {
    slug: 'been-a-while',
    name: 'Been a While',
    kind: 'iPhone 앱',
    category: 'app',
    tagline: '마지막으로 한 날부터 얼마나 지났는지',
    intro:
      '칫솔 교체나 이불 빨래처럼 가끔 하는 일을 기록하는 iPhone 앱이에요. 마지막으로 한 날짜와 그 뒤로 지난 시간을 보여 줘요.',
    points: [
      '계정 없이 사용하고, 기록은 기기에 저장해요.',
      '기기에서 로컬 알림을 보내요.',
      '기록을 파일로 직접 백업할 수 있어요.',
    ],
    stack: ['React Native(Expo)', 'TypeScript', 'Expo Router', 'SQLite'],
    links: [{ label: '소개 페이지', href: 'https://guksu.github.io/beenawhile-site/' }],
    privateRepo: true,
    dish: '김치말이국수',
    bowl: { broth: '#e3a78a', noodle: '#f8efd9', toppings: ['kimchi', 'ice', 'egg', 'sesame'] },
  },
  {
    slug: 'daily-dessert',
    name: '데일리디저트',
    kind: '모바일 앱',
    category: 'app',
    tagline: '디저트 사진을 스티커로 만들어 꾸미는 달력',
    intro:
      '먹은 디저트를 사진으로 기록하고, 사진을 캐릭터 스티커로 바꿔 달력을 꾸미는 앱이에요.',
    points: [
      '디저트 사진을 원하는 느낌의 캐릭터로 만들어요.',
      '스티커를 달력에 붙이고, 위치와 각도를 조절해요.',
      '꾸민 달력을 이미지로 저장하고 공유해요.',
    ],
    stack: ['React Native(Expo)', 'TypeScript', 'Supabase'],
    links: [],
    privateRepo: true,
    dish: '팥칼국수',
    bowl: { broth: '#70332c', noodle: '#f2e4c6', toppings: ['sesame'] },
  },
];

export function findMenu(slug: string | null): MenuItem | undefined {
  if (!slug) return undefined;
  return menu.find((item) => item.slug === slug);
}

export function menuByCategory(id: CategoryId): MenuItem[] {
  return menu.filter((item) => item.category === id);
}
