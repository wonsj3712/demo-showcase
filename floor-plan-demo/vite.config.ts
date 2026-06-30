import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 쇼케이스 통합: public/floor-plan-demo 로 빌드되어 /floor-plan-demo/ 경로로 서빙된다.
export default defineConfig({
  base: '/floor-plan-demo/',
  // 정적 자산은 static/ (public/ 은 레포 .gitignore에 걸려 커밋되지 않으므로 회피)
  publicDir: 'static',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5176,
  },
})
