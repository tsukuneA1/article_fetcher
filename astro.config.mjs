// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  'site': 'https://article-fetcher-mauve.vercel.app/',
  adapter: vercel(),
});