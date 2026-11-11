// 프로젝트별 제품 화면. 앱은 스토어 소개 이미지, 웹은 실제 화면 캡처, 나머지는 각 저장소 README의 이미지다.
// 이미지를 넣거나 빼면 이 목록도 함께 고친다. width·height는 자리를 미리 잡는 데 쓴다.
import been_a_while_01 from '../assets/shots/been-a-while/01.webp';
import been_a_while_02 from '../assets/shots/been-a-while/02.webp';
import been_a_while_03 from '../assets/shots/been-a-while/03.webp';
import been_a_while_04 from '../assets/shots/been-a-while/04.webp';
import been_a_while_05 from '../assets/shots/been-a-while/05.webp';
import builbook_01 from '../assets/shots/builbook/01.webp';
import daily_dessert_01 from '../assets/shots/daily-dessert/01.webp';
import daily_dessert_02 from '../assets/shots/daily-dessert/02.webp';
import daily_dessert_03 from '../assets/shots/daily-dessert/03.webp';
import daily_dessert_04 from '../assets/shots/daily-dessert/04.webp';
import foldlab_01 from '../assets/shots/foldlab/01.webp';
import foldlab_02 from '../assets/shots/foldlab/02.webp';
import foldlab_03 from '../assets/shots/foldlab/03.webp';
import muklog_01 from '../assets/shots/muklog/01.webp';
import muklog_02 from '../assets/shots/muklog/02.webp';
import muklog_03 from '../assets/shots/muklog/03.webp';
import muklog_04 from '../assets/shots/muklog/04.webp';
import muklog_05 from '../assets/shots/muklog/05.webp';
import noodlelens_01 from '../assets/shots/noodlelens/01.webp';
import noodlelens_02 from '../assets/shots/noodlelens/02.webp';
import noodlelens_03 from '../assets/shots/noodlelens/03.webp';
import noodlelens_04 from '../assets/shots/noodlelens/04.webp';
import qa_recorder_01 from '../assets/shots/qa-recorder/01.webp';
import suta_01 from '../assets/shots/suta/01.webp';

export interface Shot {
  src: string;
  width: number;
  height: number;
  /** 화면을 보지 못하는 사람에게 읽어 줄 설명 */
  alt: string;
}

const shots: Record<string, Shot[]> = {
  'been-a-while': [
    { src: been_a_while_01, width: 660, height: 1434, alt: 'Been a While 앱스토어 소개 이미지 1' },
    { src: been_a_while_02, width: 660, height: 1434, alt: 'Been a While 앱스토어 소개 이미지 2' },
    { src: been_a_while_03, width: 660, height: 1434, alt: 'Been a While 앱스토어 소개 이미지 3' },
    { src: been_a_while_04, width: 660, height: 1434, alt: 'Been a While 앱스토어 소개 이미지 4' },
    { src: been_a_while_05, width: 660, height: 1434, alt: 'Been a While 앱스토어 소개 이미지 5' },
  ],
  'builbook': [
    { src: builbook_01, width: 1440, height: 900, alt: 'builbook 첫 화면. 소개 문구와 시작하기 버튼' },
  ],
  'daily-dessert': [
    { src: daily_dessert_01, width: 660, height: 1434, alt: '데일리디저트 스토어 소개 이미지: 만들기' },
    { src: daily_dessert_02, width: 660, height: 1434, alt: '데일리디저트 스토어 소개 이미지: 결과' },
    { src: daily_dessert_03, width: 660, height: 1434, alt: '데일리디저트 스토어 소개 이미지: 달력' },
    { src: daily_dessert_04, width: 660, height: 1434, alt: '데일리디저트 스토어 소개 이미지: 꾸미기' },
  ],
  'foldlab': [
    { src: foldlab_01, width: 1600, height: 1000, alt: 'FoldLab 라이브 화면. 아이폰 듀오 펼침 자세와 문제 목록' },
    { src: foldlab_02, width: 1600, height: 424, alt: 'FoldLab 비교 시트. 접힘·펼침·분할 자세를 한 장으로 모은 모습' },
    { src: foldlab_03, width: 1600, height: 1302, alt: 'FoldLab 측정 화면' },
  ],
  'muklog': [
    { src: muklog_01, width: 660, height: 1428, alt: '먹로그 앱스토어 소개 이미지: 표지' },
    { src: muklog_02, width: 660, height: 1428, alt: '먹로그 앱스토어 소개 이미지: 홈' },
    { src: muklog_03, width: 660, height: 1428, alt: '먹로그 앱스토어 소개 이미지: 기록' },
    { src: muklog_04, width: 660, height: 1428, alt: '먹로그 앱스토어 소개 이미지 4' },
    { src: muklog_05, width: 660, height: 1428, alt: '먹로그 앱스토어 소개 이미지 5' },
  ],
  'noodlelens': [
    { src: noodlelens_01, width: 1600, height: 3200, alt: '요소를 고르면 대상 카드와 기본 검사가 나오는 NoodleLens 패널' },
    { src: noodlelens_02, width: 1600, height: 3200, alt: '근거 번호 버튼이 붙은 NoodleLens 답변 화면' },
    { src: noodlelens_03, width: 1600, height: 3200, alt: '모델에 보낼 내용을 미리 보고 빼는 NoodleLens 화면' },
    { src: noodlelens_04, width: 1600, height: 3200, alt: 'NoodleLens 다크 모드 화면' },
  ],
  'qa-recorder': [
    { src: qa_recorder_01, width: 1440, height: 900, alt: 'qa-recorder 데모 페이지. 설치 명령과 녹화 중 표시' },
  ],
  'suta': [
    { src: suta_01, width: 1440, height: 900, alt: 'suta 데모 사이트. 패턴 목록과 suta를 쓰기 전후를 비교한 사례' },
  ],
};

export function shotsOf(slug: string): Shot[] {
  return shots[slug] ?? [];
}
