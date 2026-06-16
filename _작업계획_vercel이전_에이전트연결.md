# demo-showcase: Vercel 이전 + STORM 에이전트 링크 + 목업 실엔진화

## Context (왜 하는가)
현재 쇼케이스는 `https://wonsj3712.github.io/demo-showcase/`(GitHub Pages). 사용자(전시·영업 시연용)는 세 가지를 원한다.
1. 주소에서 개인 아이디(`wonsj3712`)·`github` 노출 제거 → 회사 Vercel(**Sionic AI Engineering** 팀, CLI 계정 `dave-3661`)로 이전, **`dave-sionic-showcase.vercel.app`**.
2. 각 데모 카드에 "데모 화면" + "뒷단 STORM 에이전트" 링크를 함께 → 시연 때 서비스 화면과 실제 동작 에이전트를 같이 보여줌. (우선 **콘솔 deep-link**, 시연자가 로그인 상태로 직접 열어 보여주는 용도. 공개용은 추후.)
3. 목업으로 도는 내장 데모(s-life·samsungfire)를 실제 STORM 에이전트에 연결(실엔진화). 에이전트는 전부 `sample@sionicstorm.ai`(팀 Sionic AI Testbed)에 존재.

사용자는 GitHub 웹에서 직접 텍스트 수정·커밋하는 흐름을 선호 → push 시 Vercel 자동 배포 유지.

## 확정 사실 (조사 결과)
- **에이전트 ID 확보**: KODATA(공매 7470079583693017088 / 경매 7470104346279436288 / 업로드 7470398033363701760), NH(7470397423264169984), samsungfire(inbox 7459748294933057536 / extractor 7459748327345979392 / normalizer 7459738748749533184, **키 `.env`에 보유**).
- **미확보(STORM 조회 필요)**: s-life(payment/underwriting/law), IBK·KODIT·Samsung VC.
- **에이전트 deep-link 패턴 확정**: `https://www.sionicstorm.ai/ko/answer/{agentId}` (사용자 제공 예시 `7471034703909715968`) — 이 answer(채팅) 화면을 카드 에이전트 링크로 사용. 각 데모의 agentId만 매핑하면 됨.
- **STORM API**: `https://live-stargate.sionic.im`, `POST /api/v2/answer` + `storm-api-key` 헤더(인증 불필요, CORS `*` 허용). 단 키를 프론트에 노출하면 안 됨 → 서버리스 프록시 사용.
- **라우팅**: 내장 vite 데모 3개 모두 react-router 미사용(상태 기반) → base 변경 안전. manufacturing(Next.js 정적)은 경로 prefix 유지.

## Phase 1 — Vercel 이전 (메인 주소 깔끔, 옵션 A)
- vite base 3개를 루트 기준으로: `epc-demo/vite.config.js`, `s-life-insurance-poc-demo/vite.config.ts`, `samsungfire-pe-poc-demo/vite.config.ts` → `/demo-showcase/X/` → `/X/`
- `index.html`: manufacturing 카드 href만 `./manufacturing-agent-demo/` → `/demo-showcase/manufacturing-agent-demo/` (나머지 상대경로는 루트에서 정상). ⚠️ 사용자가 직접 수정한 제목·설명(fd038f8) 보존.
- 루트 빌드 인프라 신규: `package.json`(build 스크립트), `build.mjs`(vite 3개 빌드→`public/{name}`, manufacturing→`public/demo-showcase/manufacturing-agent-demo`, index.html→`public/`), `vercel.json`(`buildCommand`/`outputDirectory:public`).
- `.github/workflows/deploy.yml`(GitHub Pages) 비활성화/삭제. github.io 주소 폐기.
- `README.md` 배포 방식·새 주소 반영.

## Phase 2 — STORM 에이전트 매핑 조회
- `sample@sionicstorm.ai` 계정에서 에이전트 목록 조회(storm-cli 또는 API)로 데모별 에이전트 ID·채널키·콘솔 deep-link 확정.
  - 특히 s-life(payment/underwriting/law), IBK·KODIT·Samsung VC의 `won_*` 에이전트 매칭.
  - 콘솔 에이전트 상세 URL 패턴 1건 확인(사용자가 콘솔에서 URL 1개 제공하면 가장 확실).
- 결과를 [데모 | 에이전트 | ID | 콘솔 deep-link | (실엔진용)키] 표로 정리.
- 못 찾는 에이전트는 사용자에게 확인 요청(미발견 시 해당 카드는 에이전트 링크 생략).

## Phase 3 — 카드에 에이전트 콘솔 링크 추가 (`index.html`)
- 카드 구조 변경: `<a class="card">`(전체 링크) → `<div class="card">` 안에 데모 링크 `<a class="card-main">` + 보조 에이전트 링크 `<a class="agent-link">`(HTML 중첩 링크 금지 회피).
- 에이전트 링크: `target="_blank"`, 라벨 예 "⚙ STORM 에이전트". 에이전트 여러 개면 작은 칩 링크 여러 개(payment/underwriting/law 등) 또는 대표 1개.
- 시연자 전용임을 작게 표기(로그인 필요). 에이전트 없는 카드는 생략.

## Phase 4 — 목업 실엔진화 (s-life, samsungfire)
- Vercel 서버리스 함수 신규: `api/storm/[role].js` (또는 `api/storm.js?role=`) — POST를 받아 `live-stargate.sionic.im/api/v2/answer`로 프록시, `storm-api-key`는 **Vercel 환경변수**(`STORM_KEY_PAYMENT` 등)에서 주입(프론트 비노출).
- 각 데모 `src/api.ts` 수정: 호출 경로를 `/api/storm/{role}`로, `IS_MOCK_MODE`를 실엔진 우선으로 전환하되 **실패 시 mock 폴백 유지**(STORM SaaS 장애 대비; samsungfire는 이미 폴백 구현).
- Vercel 환경변수 등록(`vercel env add`): 6개 키(payment/underwriting/law/inbox/extractor/normalizer). 값은 Phase 2에서 확보(samsungfire는 기존 `.env` 값 재사용).
- vite proxy(dev용)는 유지(로컬 개발 호환). production은 서버리스 경유.

## 배포 절차 (Vercel CLI, Sionic AI Engineering 팀)
1. 로컬 빌드 검증: `cd demo-showcase && node build.mjs` → `public/` 확인 + 헤드리스 크롬 스크린샷
2. `vercel link`(scope=Sionic AI Engineering, project=`dave-sionic-showcase`) → 신규 프로젝트 생성
3. `vercel env add`로 STORM 키 등록(Phase 4)
4. `vercel git connect`(wonsj3712/demo-showcase) → push 자동배포
5. `vercel deploy --prod` 첫 배포
6. 배포 URL에서 전체 검증

## 리스크 / 폴백
- Vercel↔GitHub 연결 권한 막힘 → 폴백: 대시보드 Import 안내 또는 Actions+`VERCEL_TOKEN`.
- STORM 실엔진 응답 지연/장애 → api.ts에서 mock 폴백 유지로 시연 안전성 확보.
- 에이전트 키 프론트 노출 금지 → 서버리스 프록시로만 호출(절대 VITE_* 로 빌드에 넣지 않음).
- 콘솔 deep-link가 로그인 막힘은 의도된 동작(시연자용). 공개용은 별도 Phase로 추후.
- 일부 에이전트 미발견 시 해당 카드는 에이전트 링크 생략(작업 진행 막지 않음).

## 영향 / 사용자 인지
- 기존 github.io 주소 폐기, 새 주소만 사용.
- 회사 Vercel(Sionic AI Engineering)에 신규 프로젝트 1개 + STORM 키 환경변수 등록(기존 프로젝트 무관).
- 실엔진화 후 데모가 실제 STORM을 호출(응답 수초, 장애 시 자동 mock).

## 검증 (DoD)
- [ ] `dave-sionic-showcase.vercel.app` 메인 + 카드 11개 정상
- [ ] 내장 4개 데모(epc/s-life/samsungfire/manufacturing) 진입·동작 정상
- [ ] 외부 링크 7개 새 창 정상
- [ ] 에이전트 링크: 시연자 로그인 상태에서 해당 콘솔 화면 정상 오픈(데모별)
- [ ] s-life·samsungfire 실엔진 응답 수신(네트워크 탭에서 `/api/storm/*` 200) + 장애 시 mock 폴백
- [ ] GitHub 웹 수정·커밋 시 Vercel 자동 재배포 확인
```
