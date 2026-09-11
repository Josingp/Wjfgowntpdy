# 루나소프트 사내홈페이지 · 라판 전적검색 (촬영용 소품 화면)

〈쩔해주세요〉 촬영용 가짜 사내 그룹웨어 화면 + 라스트 판타지아 커뮤니티 전적검색 사이트(S#14). 화면 설정(셋업)을 서버(Upstash Redis)에 이름별로 저장해 여러 PC에서 공유합니다.

## 배포 (GitHub → Vercel)

1. 이 폴더를 GitHub 저장소에 올린다.
2. [vercel.com](https://vercel.com) → **Add New… → Project** → 저장소 선택 → 설정 그대로 **Deploy**.
3. 배포된 프로젝트 → **Storage** 탭 → **Create Database** → **Upstash for Redis** (무료 플랜) → 만들고 이 프로젝트에 **Connect**.
   - 연결하면 환경변수(`KV_REST_API_URL`, `KV_REST_API_TOKEN` 등)가 자동으로 들어갑니다.
4. **Deployments** 탭 → 최신 배포 → **⋯ → Redeploy** (환경변수 반영).
5. 배포 주소(`https://프로젝트명.vercel.app`)로 접속. `S` 키 → 설정 메뉴 상단 상태가 초록색 「서버 연결됨」이면 완료.

3번을 건너뛰면 화면은 정상 동작하지만 셋업이 그 PC 브라우저에만 저장됩니다(메뉴에 노란 글씨로 표시).

## 사용

- 특정 셋업으로 바로 열기: `https://프로젝트명.vercel.app/?setup=셋업이름`
- 단축키: `H` 안내 표시, `S` 설정 메뉴, `F`/`T` 자동 입력, `Enter` 등록/검색, `C` 댓글 폭주, `P` 인사발령 팝업, `M` 메신저 알림, `1/2/3` 사내홈페이지 화면, `4/5` 라판 전적검색 홈/결과, `R` 초기화
- 화면 전환(사내 홈페이지 ↔ 라판 전적검색)은 설정 메뉴(`S`) 맨 위 버튼 또는 숫자키

## 구조

- `public/index.html` — 화면 전체(로고 내장)
- `api/presets/index.js` — 셋업 목록
- `api/presets/[name].js` — 셋업 저장/불러오기/삭제
