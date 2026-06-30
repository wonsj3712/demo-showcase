// demo-showcase 빌드 스크립트 (Vercel buildCommand)
// vite 데모 3개를 빌드해 public/{name}으로, manufacturing(Next.js 정적 export)은
// 경로 prefix 유지를 위해 public/demo-showcase/manufacturing-agent-demo로 복사한다.
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';

const viteApps = ['epc-demo', 's-life-insurance-poc-demo', 'samsungfire-pe-poc-demo', 'db-copilot-demo', 'nh-life-copilot-demo', 'floor-plan-demo'];

console.log('[build] clean public/');
rmSync('public', { recursive: true, force: true });
mkdirSync('public', { recursive: true });

for (const app of viteApps) {
  console.log(`[build] building ${app} ...`);
  execSync('npm install && npm run build', { cwd: app, stdio: 'inherit' });
  cpSync(`${app}/dist`, `public/${app}`, { recursive: true });
}

// manufacturing-agent-demo: 정적 export, 내부 경로가 /demo-showcase/manufacturing-agent-demo/ 로
// 박혀 있어 동일 경로 유지 (재빌드/치환 없이 안전)
console.log('[build] copying manufacturing-agent-demo (prefix 유지) ...');
mkdirSync('public/demo-showcase', { recursive: true });
cpSync('manufacturing-agent-demo', 'public/demo-showcase/manufacturing-agent-demo', { recursive: true });

// 메인 쇼케이스 페이지
copyFileSync('index.html', 'public/index.html');

console.log('[build] done → public/');
