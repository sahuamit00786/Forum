import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read API_BASE_URL from api.js
function getApiBaseUrl() {
  try {
    const apiFilePath = path.resolve(__dirname, 'src/utils/api.js');
    const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
    
    // Extract the API_BASE_URL value (look for the uncommented export line)
    const lines = apiFileContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip commented lines
      if (trimmedLine.startsWith('//')) continue;
      
      // Look for export const API_BASE_URL = "..." pattern
      const match = trimmedLine.match(/export const API_BASE_URL = ["']([^"']+)["']/);
      if (match) {
        return match[1];
      }
    }
  } catch (error) {
    console.warn('Could not read API_BASE_URL from api.js:', error.message);
  }
  
  // Default fallback
  return 'http://localhost:30005/api';
}

// Get the API base URL
const apiBaseUrl = getApiBaseUrl();
console.log('🔍 Detected API_BASE_URL:', apiBaseUrl);

// Determine proxy configuration based on the API URL
let proxyConfig = {};

if (apiBaseUrl === '/api') {
  // If using /api, we need proxy - default to local
  proxyConfig = {
    '/api': {
      target: 'http://localhost:30005',
      changeOrigin: true,
      secure: false,
      configure: (proxy, _options) => {
        console.log('🚀 Proxy configured for local API (http://localhost:30005)');
        proxy.on('error', (err, _req, _res) => {
          console.log('❌ Proxy error:', err.message);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('📤 Request:', req.method, req.url, '→ http://localhost:30005');
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('📥 Response:', proxyRes.statusCode, req.url);
        });
      },
    }
  };
} else if (apiBaseUrl.includes('localhost:30005')) {
  // If using localhost:30003 directly, no proxy needed
  console.log('🏠 Using direct local API connection (no proxy needed)');
} else if (apiBaseUrl.includes('https://api.marinersforum.com')) {
  // If using production API directly, no proxy needed
  console.log('🌐 Using direct production API connection (no proxy needed)');
} else {
  // Unknown configuration, default to local proxy
  console.log('⚠️ Unknown API configuration, defaulting to local proxy');
  proxyConfig = {
    '/api': {
      target: '5',
      changeOrigin: true,
      secure: false,
    }
  };
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    ...(Object.keys(proxyConfig).length > 0 ? { proxy: proxyConfig } : {})
  }
});