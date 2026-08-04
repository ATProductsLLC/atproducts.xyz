import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        jquery: '/node_modules/jquery'
      }
    }
  },
  integrations: [
    react(),
  ],
  adapter: netlify(),
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-body",
    },
    {
      provider: fontProviders.local(),
      name: "Croogla 4F",
      cssVariable: "--font-title",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/Croogla4F.woff"],
            display: "block"
          },
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/Croogla4F.woff2"],
            display: "block"
          }
        ]
      }
    }
  ],
});
