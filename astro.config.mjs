import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import auth from "auth-astro"

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
  integrations: [auth(), react(), tailwind({ applyBaseStyles: false })],
  vite: {
    build: {
      minify: false,
    },
    ssr: {
      external: ["node:path", "node:async_hooks"],
    },
  },
})
