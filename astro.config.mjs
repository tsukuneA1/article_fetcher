// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  'site': 'https://article-fetcher-mauve.vercel.app/',
  adapter: netlify(),
});