// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  'site': 'https://article-fetcher-mauve.vercel.app/',
  adapter: vercel(),
  integrations: [react()],
});