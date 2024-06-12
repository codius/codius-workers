import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
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
  integrations: [auth(), react()],
  vite: {
    build: {
      minify: false,
    },
    ssr: {
      external: ["node:path"],
    },
  },
})
