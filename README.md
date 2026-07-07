# Sionic AI Demo Showcase (Internal)

Sionic AI 데모 웹 앱 모음. 전시·영업 시연 때 데모 화면을 한곳에서 꺼내볼 수 있는 쇼케이스 사이트입니다.

**라이브**: https://sionic-showcase-internal.vercel.app

- 파트너·고객사에 링크 공유 가능(카드·화면 익명화 적용). 민감 데모 2종(파이낸스 온톨로지, Parse Differ)은 배너만 노출하고 링크는 제공하지 않습니다.
- 각 카드의 "에이전트" 칩은 STORM 플랫폼(sionicstorm.ai, team.kr 사업팀) answer 화면으로, 시연자 로그인 후 열립니다.
- 데모별 실제 고객사·에이전트 매핑 등 내부 상세는 `_마스터계획.md` 참조.

## 구조

- **내장 데모** (이 레포에서 빌드): `epc-demo/`, `s-life-insurance-poc-demo/`, `samsungfire-pe-poc-demo/`, `db-copilot-demo/`, `floor-plan-demo/` (Vite) + `manufacturing-agent-demo/` (Next.js 정적, prefix 유지 복사)
  - `nh-life-copilot-demo/`는 카드 정리(2026-07-07)로 빌드 제외, 소스만 보존
- **외부 링크 데모**: 별도 Vercel 프로젝트로 배포된 데모를 카드에서 새 창으로 연결
- **빌드**: `node build.mjs` → `public/` (Vercel buildCommand)
- **서버리스 프록시**: `api/storm/[role].js` — 실엔진 데모의 STORM 호출 중계 (키는 Vercel 환경변수 `STORM_KEY_*`)

## 배포

master push → Vercel 자동 빌드·배포. 수동 배포는 `vercel deploy --prod`.

## 데모 추가 방법

1. **내장(Vite)**: 데모 폴더 생성 → `build.mjs`의 `viteApps`에 추가 → `index.html`에 카드 추가
2. **외부 호스팅**: 별도 Vercel 프로젝트로 배포 → `index.html`에 카드 추가 (`target="_blank" rel="noopener"`)
3. 폴더 배지(`folder-count`) 숫자 갱신 잊지 말 것
