# Manufacturing Agent Demo — Source Code Location

이 폴더는 **빌드 결과물(static export)** 만 포함합니다.

## 소스 코드 위치

원본 TypeScript 소스 코드는 다음 레포에 있습니다 (Private + Archived 상태):

🔗 **https://github.com/wonsj3712/manufacturing-agent-demo**

## 수정·재빌드가 필요할 때

1. 원본 레포 unarchive (Settings → Archive this repository → Unarchive)
2. 로컬 클론 후 수정
3. `npm run build` → `out/` 폴더 생성
4. `out/` 내용을 이 폴더로 복사
5. demo-showcase에 커밋·푸시 → GitHub Actions 자동 배포
6. 검증 후 원본 레포 다시 아카이브

## 주의

- 이 폴더의 압축된 chunk JS·HTML을 직접 수정하지 마세요 (사실상 불가능)
- 원본 레포의 README.md에 더 자세한 이관·수정 가이드가 있습니다
