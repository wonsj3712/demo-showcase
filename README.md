# Demo Showcase

Sionic AI 데모 웹 앱 모음. 쉽게 데모 화면을 확인할 수 있도록 GitHub Pages로 호스팅합니다.

**데모 목록 페이지**: https://wonsj3712.github.io/demo-showcase/

## Demos

| 데모 | 설명 | URL | 소스 |
|------|------|-----|------|
| EPC Email Issue Management | EPC 프로젝트 이메일 기반 이슈 추적/분류/대시보드 | [바로가기](https://wonsj3712.github.io/demo-showcase/epc-demo/) | `epc-demo/` (이 레포) |
| Manufacturing Agent Demo | DK산업 제조업 설비 예방보전 AI 데모 (Next.js 정적 export, 목업 모드) | [바로가기](https://wonsj3712.github.io/demo-showcase/manufacturing-agent-demo/) | [wonsj3712/manufacturing-agent-demo](https://github.com/wonsj3712/manufacturing-agent-demo) (Private + Archived) |

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
