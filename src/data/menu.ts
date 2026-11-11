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
  /** 맛 포인트 — 핵심 기능 */
  points: string[];
  /** 재료 — 기술 스택 */
  stack: string[];
  /** 첫 번째 링크가 주 버튼이 된다 */
  links: MenuLink[];
  /** 저장소가 비공개인지 */
  privateRepo?: boolean;
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
    tagline: 'AI가 만든 티가 나는 UI를 줄여요',
    intro:
      'Claude Code와 Codex가 React UI를 만들 때 쓰는 스킬이에요. 키보드로 쓸 수 있고, 포커스가 제자리로 돌아오고, 작은 화면에서 넘치지 않고, 동작 줄이기 설정을 따르는 UI가 나오게 도와요.',
    points: [
      '키보드 접근, 대화상자를 여닫을 때의 포커스, 320~390px 화면에서의 넘침, 글자 대비, 동작 줄이기를 규칙으로 다뤄요.',
      '모달·바텀시트·토스트·드롭다운 같은 UI 패턴 57종을 복사해 써요. 패턴마다 의존성 없는 TypeScript 코어, React 래퍼, CSS가 들어 있어요.',
      '파일을 고칠 때마다 검사해서 11px보다 작은 글자, 레이아웃 속성 애니메이션 같은 오류를 알려 줘요.',
      '같은 요청을 조건마다 8번씩 돌려 비교했더니 접근성 위반(axe, 390px)이 16건에서 1건으로 줄었어요(suta 0.14).',
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
    tagline: '바뀐 줄 밖까지 읽는 코드 리뷰',
    intro:
      'Claude Code와 Codex용 코드 리뷰 스킬이에요. 리뷰하기 전에 바뀐 줄 바깥의 맥락을 먼저 모아요. 바뀐 함수와 타입을 쓰는 다른 코드, PR과 이슈에 적힌 요구사항, 예전에 고친 버그를 되돌리는지까지 확인해요.',
    points: [
      '이번 변경이 건드리지 않은 코드가 바뀐 함수·타입·문자열을 쓰는지 찾아요.',
      'PR과 이슈에 적힌 요구사항, PR 설명에 쓴 주장을 실제 변경과 맞춰 봐요.',
      '바뀐 줄을 넣은 커밋을 찾아 예전 수정을 되돌리는지 보고, PR의 CI 결과도 읽어요.',
      '어떤 입력에서 무엇이 잘못되는지와 근거 위치를 댈 수 있는 지적만 남겨요.',
    ],
    stack: ['JavaScript', 'Claude Code·Codex 스킬'],
    links: [repo('gimi')],
    dish: '잔치국수',
    bowl: { broth: '#dcc588', noodle: '#f8f1dc', toppings: ['egg', 'scallion', 'gim'] },
  },
  {
    slug: 'guksu-harness',
    name: 'guksu-harness',
    kind: '하네스',
    category: 'ai',
    tagline: 'AI 에이전트가 팀 규칙을 지키며 일하게 해요',
    intro:
      'AI 코딩 에이전트는 팀 규칙이 문서에 있어도 읽기 전에 움직이곤 해요. guksu-harness는 팀 규칙을 에이전트가 시작할 때 읽는 파일에 연결하고, 규칙을 놓친 위험한 행동은 훅으로 막아요.',
    points: [
      '보호 브랜치 편집, 민감정보 파일 읽기, reset·push --force 같은 Git 명령을 막아요.',
      '꼭 지킬 규칙 네 줄은 CLAUDE.md·AGENTS.md에 넣고, 나머지 팀 규칙은 그 파일이 가리키는 문서에 둬요.',
      '저장소를 읽어 설정을 제안하고, 팀만 아는 결정만 물어요.',
      '새 버전으로 올려도 팀이 고친 설정과 규칙은 덮어쓰지 않아요.',
    ],
    stack: ['JavaScript', 'Node.js 22', 'Claude Code·Codex 훅'],
    links: [repo('guksu-harness'), { label: 'npm', href: 'https://www.npmjs.com/package/guksu-harness' }],
    dish: '우동',
    bowl: { broth: '#a97a40', noodle: '#f4e8c8', toppings: ['fishcake', 'scallion', 'gim'] },
  },
  {
    slug: 'geulppal',
    name: '글빨',
    kind: '스킬',
    category: 'ai',
    tagline: 'Claude가 쓴 한국어를 평소 쓰는 말로 다듬어요',
    intro:
      'Claude가 쓴 한국어를 사람들이 평소에 쓰는 한국어로 다듬는 스킬이에요. 영어 표현을 낱말대로 옮긴 말, 설명 없이 쓴 이름, 명사만 늘어놓거나 화살표로 대신한 문장을 고쳐요.',
    points: [
      '번역투를 고쳐요. 예를 들어 "조용히 버려집니다"는 "오류 없이 버려집니다"가 돼요.',
      '내용은 그대로 둬요. 원문에 없는 사실은 보태지 않고, 확인할 것이 있을 때만 짧게 알려요.',
      '다 쓴 글을 다듬을 때 효과가 가장 분명했어요.',
    ],
    stack: ['Claude 스킬', 'JavaScript'],
    links: [repo('geulppal')],
    dish: '콩국수',
    bowl: { broth: '#f2ecdb', noodle: '#ecdcae', toppings: ['cucumber', 'sesame'] },
  },
  {
    slug: 'tokkaebi',
    name: 'tokkaebi',
    kind: 'CLI',
    category: 'ai',
    tagline: 'Claude Code에 쓴 토큰과 비용을 터미널에서 봐요',
    intro:
      'Claude Code가 내 컴퓨터에 남기는 사용 기록을 읽어서 오늘 얼마 썼는지, 어떤 프로젝트가 많이 썼는지, 캐시로 얼마나 아꼈는지를 터미널에서 바로 보여 주는 CLI 도구예요.',
    points: [
      '내 컴퓨터 안에서만 동작해요. 서버도 로그인도 없어요.',
      '원본 기록을 직접 읽어서, 설치하기 전 사용량까지 집계해요.',
      '같은 응답이 여러 번 남은 기록을 걸러 내고, 캐시 종류별 단가를 반영해 비용을 계산해요.',
      '요일·시간대 히트맵, 주간 추이, 월 예산, 월간·연간 결산을 볼 수 있어요.',
    ],
    stack: ['TypeScript', 'Node.js CLI'],
    links: [repo('tokkaebi'), { label: 'npm', href: 'https://www.npmjs.com/package/tokkaebi' }],
    dish: '짬뽕',
    bowl: { broth: '#c5492c', noodle: '#f3dfae', toppings: ['scallion', 'chili', 'zucchini'] },
  },
  {
    slug: 'qa-recorder',
    name: 'qa-recorder',
    kind: '라이브러리',
    category: 'library',
    tagline: '버튼 한 번으로 버그 상황을 리포트 하나에 담아요',
    intro:
      '웹 앱의 버그 상황을 한 번에 모으는 QA 라이브러리예요. 화면을 영상으로 찍지 않고 rrweb으로 DOM을 직렬화해서 세션 흐름, 네트워크 요청, 콘솔 에러를 HTML 리포트 하나로 묶어요. 백엔드도 브라우저 확장도 필요 없어요.',
    points: [
      'DOM 변화를 기록해 세션을 다시 재생해요. 화면 공유 권한이 필요 없어서 모바일과 WebView에서도 동작해요.',
      'fetch와 XHR 요청을 최근 100건까지 모아 HAR 1.2 파일로 내보내요.',
      '리포트에서 네트워크 행이나 콘솔 항목을 누르면 세션 재생이 그 순간으로 이동해요.',
      '비밀번호·토큰 같은 민감한 값은 저장하기 전에 가려요.',
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
    tagline: '폴더블 기기에서 웹이 어떻게 보이는지 자세별로 재현해요',
    intro:
      '폴더블·플립·듀얼 스크린 기기에서 웹사이트가 어떻게 보이는지 재현하고 문제를 찾아 주는 디버거예요. 주소를 넣으면 실제 크롬 엔진으로 접힘·펼침·반 접힘·화면 분할 자세를 차례로 재현해요.',
    points: [
      '기기 프레임 안의 화면을 클릭·드래그·키보드로 직접 조작하면서 봐요.',
      '화면이 바뀔 때마다 24개 규칙으로 검사하고, 원인 요소와 고치는 방법을 알려 줘요.',
      '고른 자세들을 한 장으로 캡처해 PNG나 Markdown으로 PR에 붙일 수 있어요.',
      '내 PC에서 띄우는 도구라 localhost 개발 서버도 검사해요.',
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
    tagline: '요소를 골라 레이아웃 문제를 GPT·Claude에게 물어요',
    intro:
      '웹페이지에서 요소를 골라 레이아웃·스타일 문제를 묻는 Chrome 사이드 패널 확장 프로그램이에요. 스크린샷만 보고 추측하지 않고, 고른 요소의 DOM 일부와 실제 적용된 스타일, 크기 측정값을 근거로 답해요.',
    points: [
      '가로 넘침, 말줄임 조건, flex·grid 크기 문제는 모델에 묻기 전에 코드로 먼저 계산해요.',
      '답변에 붙은 근거 번호를 누르면 페이지에서 그 요소가 강조돼요.',
      '질문하기 전에 모델에 보낼 내용을 그대로 보고, 빼고 싶은 것은 뺄 수 있어요.',
      '내 API 키로 직접 보내요. 개발자 서버는 없어요.',
    ],
    stack: ['TypeScript', 'React', 'Chrome 사이드 패널', 'OpenAI·Anthropic API'],
    links: [repo('NoodleLens')],
    dish: '비빔국수',
    bowl: { broth: '#ead9ae', noodle: '#f4e6c2', toppings: ['sauce', 'cucumber', 'egg', 'sesame'] },
  },
  {
    slug: 'builbook',
    name: 'builbook',
    kind: '웹 앱',
    category: 'web',
    tagline: '입문 작가도 바로 쓰는 웹소설 집필 에디터',
    intro:
      '웹소설 집필 에디터예요. 스크리브너를 참고하되 입문 작가도 바로 쓸 수 있게 진입장벽을 낮췄어요. 로그인이나 서버 없이 모든 데이터를 브라우저에 보관해요.',
    points: [
      '문서 트리에서 회차를 만들고 옮기고, 폴더를 고르면 회차들을 한 화면에서 이어서 써요.',
      '입력이 멎으면 자동으로 저장하고, 저장에 실패하면 백업을 남겨요.',
      '회차 분량표, 연속 집필일, 고유명사 사전, 인물 관계도 같은 연재 도구가 있어요.',
      'TXT·마크다운·DOCX로 내보내고, 오프라인에서도 열려요.',
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
    tagline: '브라우저 안에서 끝나는 동영상 압축',
    intro:
      '서버 없이 브라우저 안에서만 도는 동영상 압축기예요. 영상이 기기 밖으로 나가지 않아요. GPU를 쓰는 WebCodecs를 먼저 쓰고, 안 되면 FFmpeg.wasm으로 넘어가요.',
    points: [
      '업로드가 없어요. 영상은 브라우저에만 머물러요.',
      'WebCodecs를 쓸 수 없으면 FFmpeg.wasm으로 자동 전환해요.',
      '품질 슬라이더, 해상도 변경, 오디오 제거를 지원해요.',
      '압축 전후 용량과 줄어든 비율을 보여 주고 바로 내려받을 수 있어요.',
    ],
    stack: ['Vite', 'TypeScript', 'WebCodecs', 'FFmpeg.wasm', 'mp4box.js', 'mp4-muxer'],
    links: [{ label: '써 보기', href: 'https://video-encoder-henna.vercel.app' }, repo('video-encoder')],
    dish: '쌀국수',
    bowl: { broth: '#d9ba7c', noodle: '#fbf6e6', toppings: ['scallion', 'chili', 'sesame'] },
  },
  {
    slug: 'muklog',
    name: '먹로그',
    kind: 'iOS 앱',
    category: 'app',
    tagline: '함께 다닌 맛집을 사진·메모·위치로 기록해요',
    intro:
      '커플이나 친구가 함께 다닌 맛집을 기록하는 앱이에요. 로그라는 공유 공간을 만들고 초대코드로 초대해요. 다녀온 음식점을 사진·별점·메모와 함께 남기면 지도 위 핀으로 모여요.',
    points: [
      '로그를 여러 개 만들어 연인끼리, 친구끼리, 혼자서도 쓸 수 있어요. 한 로그에 5명까지 들어와요.',
      '장소를 검색하면 좌표와 주소가 채워지고, 사진 5장까지와 별점·메모를 남겨요.',
      '지도에서 내 맛집, 주변 음식점, 가 보고 싶은 곳을 한 화면에 봐요.',
      '위시리스트에 담아 둔 곳은 다녀온 뒤 기록으로 바꿀 수 있어요.',
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
    tagline: '마지막으로 한 게 언제였는지 기억해 줘요',
    intro:
      '칫솔 교체, 이불 빨래, 필터 교체, 이발처럼 가끔 돌아오는 일을 마지막으로 언제 했는지 기억해 주는 iPhone 앱이에요. 얼마나 지났는지 한눈에 보여 줘요.',
    points: [
      '계정이 없어요. 입력한 내용은 모두 기기 안에만 있어요.',
      '알림은 기기에서 보내는 로컬 알림이에요.',
      '백업은 직접 저장하는 파일로 해요.',
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
    tagline: '디저트 사진으로 달력을 꾸며요',
    intro:
      '먹은 디저트를 사진으로 남기고 달력에 붙여 꾸미는 기록 앱이에요. 사진을 귀여운 디저트 친구로 바꿔 스티커처럼 쓸 수 있어요.',
    points: [
      '디저트 사진을 원하는 느낌의 디저트 친구로 만들어요.',
      '만든 친구를 달력에 붙이고 옮기고 돌려서 꾸며요.',
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
