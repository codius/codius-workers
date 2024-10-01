# Dispatch Worker

Cloudflare [Workers for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/) [dynamic dispatch worker](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/how-workers-for-platforms-works/#dynamic-dispatch-worker)

## :wrench: Setup

### Cloudflare

Subscribe to the Workers for Platforms [Paid plan](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/platform/pricing/) in your Cloudflare dashboard.

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
