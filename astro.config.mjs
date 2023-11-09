import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

// import nodejs from '@astrojs/node'
import netlify from '@astrojs/netlify/functions'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // adapter: nodejs({ mode: 'standalone' }),
  adapter: netlify(),
  integrations: [tailwind({ applyBaseStyles: false })],
})
