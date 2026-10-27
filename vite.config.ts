import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// The Gemini key used to be injected here (`define: process.env.API_KEY`),
// which copied it into the JavaScript every visitor downloads. It is no
// longer injected: the key comes from the person using the app or from the
// AI Studio host at runtime; see services/apiKey.ts.
//
// This plugin fails any build whose output contains something shaped like a
// Google API key, so the old mistake cannot come back unnoticed.
const GOOGLE_KEY_RE = /AIza[0-9A-Za-z_-]{35}/;
function noEmbeddedKeys(): Plugin {
  return {
    name: 'no-embedded-api-keys',
    generateBundle(_options, bundle) {
      for (const [file, chunk] of Object.entries(bundle)) {
        const text = chunk.type === 'chunk' ? chunk.code : typeof chunk.source === 'string' ? chunk.source : '';
        if (GOOGLE_KEY_RE.test(text)) {
          this.error(`${file} contains a Google API key. Keys must not be bundled into the client.`);
        }
      }
    },
  };
}

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), noEmbeddedKeys()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
