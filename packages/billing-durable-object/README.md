# Billing Durable Object

Cloudflare [Durable Object](https://developers.cloudflare.com/durable-objects/) for worker billing

## :wrench: Setup

The Billing Durable Object is managed via the [`dispatch-worker`](../dispatch-worker).

### Environment Variables

Environment variables and secrets are managed in the `dispatch-worker`'s [wrangler.toml](../dispatch-worker/wrangler.toml) file's `[vars]` section and `.dev.vars` file.

### Deployment

The Billing Durable Object is deployed via the [`dispatch-worker`](../dispatch-worker).
It is configured in the `dispatch-worker`'s [wrangler.toml](../dispatch-worker/wrangler.toml) file's `[[durable_objects.bindings]]` and `[[migrations]]` sections.
