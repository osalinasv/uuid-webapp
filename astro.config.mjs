import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

import netlify from '@astrojs/netlify/functions'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({ functionPerRoute: false }),
  integrations: [tailwind({ applyBaseStyles: false })],
})
