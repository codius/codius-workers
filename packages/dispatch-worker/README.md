# Dispatch Worker

Cloudflare Workers for Platforms [dynamic dispatch worker](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/how-workers-for-platforms-works/#dynamic-dispatch-worker)

## :wrench: Setup

### Environment Variables

Environment variables are managed in [wrangler.toml](./wrangler.toml) and secrets in `.dev.vars`.

```bash
cp .example.dev.vars .dev.vars
```

## 🧞 Commands

### Deploy

```bash
pnpm --filter dispatch-worker wrangler deploy
```
