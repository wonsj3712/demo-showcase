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
    base: '/samsungfire-pe-poc-demo/',
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/storm-api/inbox': {
          ...proxyForKey(env.VITE_STORM_KEY_INBOX),
          rewrite: (path) => path.replace(/^\/storm-api\/inbox/, ''),
        },
        '/storm-api/extractor': {
          ...proxyForKey(env.VITE_STORM_KEY_EXTRACTOR),
          rewrite: (path) => path.replace(/^\/storm-api\/extractor/, ''),
        },
        '/storm-api/normalizer': {
          ...proxyForKey(env.VITE_STORM_KEY_NORMALIZER),
          rewrite: (path) => path.replace(/^\/storm-api\/normalizer/, ''),
        },
      },
    },
  };
});
