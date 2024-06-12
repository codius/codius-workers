import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import auth from "auth-astro"

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [auth(), react(), tailwind({ applyBaseStyles: false })],
  vite: {
    build: {
      minify: false,
    },
    ssr: {
      external: ["node:path"],
    },
  },
})
