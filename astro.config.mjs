import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
/* import compress from "astro-compress"; */

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        jquery: '/node_modules/jquery'
      }
    }
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-body",
    },
    {
      provider: fontProviders.google(),
      name: "Zen Dots",
      cssVariable: "--font-title",
    },

  ],
  integrations: [
    react()/*, 
    compress({
      css: false,
      html: true,
      img: true,
      js: true,
      image: true,
      svg: true,
    })
    */
  ]
})