import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/validate-vehicle': {
        target: 'https://driver-vehicle-licensing.api.gov.uk',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api\/validate-vehicle/,
            '/vehicle-enquiry/v1/vehicles'
          ),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-api-key', 'HIDDEN');  // ← your DVLA key
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        },
      },
    },
  },
});

/*
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy everything under /api/mot-history → DVSA MOT History API
      '/api/mot-history': {
        target: 'https://beta.check-mot.service.gov.uk',
        changeOrigin: true,
        rewrite: (path) =>
          // turn `/api/mot-history?registration=ZZ99ABC`
          // into `/trade/vehicles/mot-tests?registration=ZZ99ABC`
          path.replace(
            /^\/api\/mot-history/,
            '/trade/vehicles/mot-tests'
          ),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // DVSA requires these headers:
            proxyReq.setHeader('Accept', 'application/json+v6');
            proxyReq.setHeader('x-api-key', ''); 
          });
        },
      },
    },
  },
});
*/