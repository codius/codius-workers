import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import clerk from "@clerk/astro"
import { defineConfig } from "astro/config"
import simpleStackQuery from "simple-stack-query"

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    actions: true,
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "wrangler.toml",
    },
  }),
  integrations: [
    clerk(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    simpleStackQuery(),
  ],
  security: {
    checkOrigin: true,
  },
})
