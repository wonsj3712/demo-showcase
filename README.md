# Dave's Sionic AI Demo Showcase

Sionic AI 데모 웹 앱 모음. 전시·영업 시연 때 쉽게 데모 화면을 꺼내볼 수 있도록 GitHub Pages로 호스팅합니다.

**데모 목록 페이지**: https://wonsj3712.github.io/demo-showcase/

## Demos

| 데모 | 설명 | URL | 소스 |
|------|------|-----|------|
| EPC Email Issue Management | EPC 프로젝트 이메일 기반 이슈 추적/분류/대시보드 | [바로가기](https://wonsj3712.github.io/demo-showcase/epc-demo/) | `epc-demo/` (이 레포) |
| Manufacturing Agent Demo | DK산업 제조업 설비 예방보전 AI 데모 (Next.js 정적 export, 목업 모드) | [바로가기](https://wonsj3712.github.io/demo-showcase/manufacturing-agent-demo/) | [wonsj3712/manufacturing-agent-demo](https://github.com/wonsj3712/manufacturing-agent-demo) (Private + Archived) |
| S Life Insurance PoC Insurance Agent | 지급심사·가입심사·법령개정 비교 3종 AI 에이전트. 4요소 카드 답변 + 의심 영역 자동 식별 (STORM 워크플로우) | [바로가기](https://wonsj3712.github.io/demo-showcase/s-life-insurance-poc-demo/) | `s-life-insurance-poc-demo/` (이 레포) |
| Samsung Fire · 해외 사모펀드 입출금 자동화 PoC | C-Lab 3차 임원 심사 데모. 공용 메일함 분류, 공통 노티스 S23 코드 검색, 펀드사별 용어 온톨로지 매핑, USD/EUR/JPY 환산, 사람 컨펌. PoC ↔ 본사업 SI 경계 시각화. | [바로가기](https://wonsj3712.github.io/demo-showcase/samsungfire-pe-poc-demo/) | `samsungfire-pe-poc-demo/` (이 레포) |

## 라이브 배포 데모 (외부 호스팅 · 새 창)

외부 서버에 이미 배포된 데모를 링크로 연결합니다(방식 C). 소스/빌드 결과물은 이 레포에 복사하지 않습니다.

| 데모 | 설명 | URL | 소스/호스팅 |
|------|------|-----|------|
| Venture Capital Ontology | Venture capital ontology | [바로가기](https://dev-samsung-vc-insight.sionic.im/login) | 외부 호스팅 (sionic.im, 로그인 필요) |
| IBK 1stLab · AI 주택담보대출 간편심사 | IBK기업은행 혁신랩(1stLab) AI 기반 주택담보대출 간편심사 UI | [바로가기](https://ibk-1stlab-loan-screening-ui-sable.vercel.app/) | 외부 호스팅 (Vercel) |
| KODIT · 기술보증기금 데모 | 기술보증기금(KODIT) 대상 AI 데모 (상세 미확인) | [바로가기](https://sionic-kodit.vercel.app/) | 외부 호스팅 (Vercel, 로그인 필요) |
| KODATA · STORM 감정평가서 데이터화 | 한국평가데이터(KODATA) 과제. 부동산 감정평가서 디지털화·항목 추출·근거 기반 질의응답 | [바로가기](https://kodata-appraisal-demo.vercel.app/) | 외부 호스팅 (Vercel) |
| STORM APIs Parse Differ | STORM 문서 파싱 결과를 비교·검증하는 도구 데모 | [바로가기](https://storm-apis-parse-differ.vercel.app/) | 외부 호스팅 (Vercel, 로그인 필요) |
| NH농협 · 펀드 설명서 대조 PoC | NH농협은행 준법감시부 펀드 설명서 대조 PoC. DART 공시 vs 운용사 설명서 AI 자동 대조 | [바로가기](https://nh-fund-poc.vercel.app) | 외부 호스팅 (Vercel, 접근암호 필요) |
| NH 컴플리가드 · 본사업 제안 데모 | 펀드 설명서 대조 본사업 비전 데모 (NH CompliGuard) | [바로가기](https://nh-compliguard-demo.vercel.app) | 외부 호스팅 (Vercel) |

## 자동 배포

`master` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 + 배포합니다. 별도 빌드 명령 불필요.

## 데모 추가 방법

데모 종류에 따라 두 가지 방식 중 하나로 추가합니다.

### 방식 A — 이 레포 안에서 빌드 (Vite 등 가벼운 데모)
1. 이 레포에 `{데모폴더명}/` 생성, 소스코드 + 데이터 + `package.json` 포함
2. `vite.config.js`에 `base: '/demo-showcase/{데모폴더명}/'` 설정
3. `.github/workflows/deploy.yml`에 해당 폴더 빌드 단계 추가
4. 루트 `index.html`에 카드 추가, 이 README 표에도 추가
5. push → 자동 빌드/배포

예시: `epc-demo/`

### 방식 B — 외부 레포에서 빌드한 결과물만 복사 (대형 SPA·Next.js 등)
1. 별도 레포에서 소스 관리 + 빌드 (`npm run build` → `out/` 등)
2. 빌드 결과물(`out/` 내용)을 이 레포의 `{데모폴더명}/` 폴더에 복사
3. `{데모폴더명}/SOURCE.md`로 원본 위치 명시
4. 루트 `index.html`에 카드 추가, 이 README 표에 소스 컬럼 함께 기입
5. `.github/workflows/deploy.yml`의 `Assemble site` 단계에 `cp -r {데모폴더명}/. _site/{데모폴더명}/` 추가
6. push → 자동 배포

예시: `manufacturing-agent-demo/` — 소스는 [wonsj3712/manufacturing-agent-demo](https://github.com/wonsj3712/manufacturing-agent-demo) (Private + Archived). 수정 시 그 레포를 unarchive하여 작업할 것

### 방식 C. 외부 호스팅 링크만 연결 (HF Space·Vercel 등 백엔드 포함 데모)

FastAPI·Flask·Next.js SSR처럼 **서버가 필요한** 앱은 GitHub Pages 정적 배포가 불가능합니다. 이 경우 별도 호스팅에 올리고 쇼케이스에서는 링크만 연결합니다.

1. 별도 호스팅(HF Space, Vercel, Railway 등)에 배포하고 공개 URL 확보
2. 루트 `index.html`에 카드 추가. `href`는 외부 URL, `target="_blank" rel="noopener"` 필수
3. 이 README 표에 행 추가. URL은 외부 호스팅, 소스 컬럼에 원본 레포 + 호스팅 링크 병기
4. 이 레포엔 소스/빌드 결과물을 복사하지 않음. 링크만 유지
5. master push → 즉시 반영 (별도 빌드 단계 없음)
