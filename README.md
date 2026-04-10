# Demo Showcase

Sionic AI 데모 웹 앱 모음. 쉽게 데모 화면을 확인할 수 있도록 GitHub Pages로 호스팅합니다.

**데모 목록 페이지**: https://wonsj3712.github.io/demo-showcase/

## Demos

| 데모 | 설명 | URL |
|------|------|-----|
| EPC Email Issue Management | EPC 프로젝트 이메일 기반 이슈 추적/분류/대시보드 | [바로가기](https://wonsj3712.github.io/demo-showcase/epc-demo/) |

## 자동 배포

`master` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 + 배포합니다. 별도 빌드 명령 불필요.

## 데모 추가 방법

1. 이 레포에 `{데모폴더명}/` 생성, 소스코드 + 데이터 + `package.json` 포함
2. `vite.config.js`에 `base: '/demo-showcase/{데모폴더명}/'` 설정
3. `.github/workflows/deploy.yml`에 해당 폴더 빌드 단계 추가
4. 루트 `index.html`에 카드 추가, 이 README 표에도 추가
5. push → 자동 빌드/배포
