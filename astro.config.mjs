import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";

import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [auth()]
});