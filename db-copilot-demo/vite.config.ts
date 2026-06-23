import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const stormBase = env.VITE_STORM_BASE_URL || 'https://live-stargate.sionic.im';

  const proxyForKey = (key: string) => ({
    target: stormBase,
    changeOrigin: true,
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        if (key) proxyReq.setHeader('storm-api-key', key);
      });
    },
  });

  return {
    base: '/db-copilot-demo/',
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/storm-api/copilot': {
          ...proxyForKey(env.VITE_STORM_KEY_COPILOT),
          rewrite: (path) => path.replace(/^\/storm-api\/copilot/, ''),
        },
        '/storm-api/qa': {
          ...proxyForKey(env.VITE_STORM_KEY_QA),
          rewrite: (path) => path.replace(/^\/storm-api\/qa/, ''),
        },
      },
    },
  };
});
