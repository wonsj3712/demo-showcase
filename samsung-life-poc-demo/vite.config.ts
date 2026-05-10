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
    base: '/demo-showcase/samsung-life-poc-demo/',
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/storm-api/payment': {
          ...proxyForKey(env.VITE_STORM_KEY_PAYMENT),
          rewrite: (path) => path.replace(/^\/storm-api\/payment/, ''),
        },
        '/storm-api/underwriting': {
          ...proxyForKey(env.VITE_STORM_KEY_UNDERWRITING),
          rewrite: (path) => path.replace(/^\/storm-api\/underwriting/, ''),
        },
        '/storm-api/law': {
          ...proxyForKey(env.VITE_STORM_KEY_LAW),
          rewrite: (path) => path.replace(/^\/storm-api\/law/, ''),
        },
      },
    },
  };
});
