# Codius Astro

## :jigsaw: Components

### Cloudflare Pages

- [Astro Framework](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site)
- [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter

### [Astro Actions](https://docs.astro.build/en/reference/configuration-reference/#experimentalactions)

- [Actions + Cloudflare](https://github.com/withastro/astro/issues/11005)

## :wrench: Setup

### Setup Cloudflare D1 Database

```bash
pnpm --filter codius-astro drizzle-kit generate
pnpm --filter codius-astro d1 create <your-d1-db-name>
pnpm --filter codius-astro d1 migrations apply <your-d1-db-name> --local
pnpm --filter codius-astro d1 migrations apply <your-d1-db-name> --remote
```

> **Note:** Rollback local migrations by deleting the state files with the following command:
>
> ```bash
> rm packages/codius-astro/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*
> ```

### Environment Variables

Environment variables are managed in [wrangler.toml](./wrangler.toml) and secrets in `.dev.vars`.

```bash
cp .example.dev.vars .dev.vars
```

#### GitHub OAuth App

You'll need to [create a GitHub OAuth App](https://authjs.dev/guides/configuring-github#creating-an-oauth-app-in-github) with:

![GitHub OAuth app](assets/oauth-app.png)

> **Note:** Use `127.0.0.1:8788` if running with `pnpm run dev` instead of `pnpm run preview`

Update `GITHUB_APP_NAME` and `GITHUB_CLIENT_ID` in [wrangler.toml](./wrangler.toml) with the values from the GitHub OAuth App.

Update `GITHUB_CLIENT_SECRET` in `.dev.vars` with the value from the GitHub OAuth App.

#### GitHub Access Token

You'll need to [create a GitHub Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with Read and Write access to actions in order for codius-astro to deploy workers via its [GitHub Actions workflow](./.github/workflows/deploy-worker.yml).

Update `GITHUB_ACCESS_TOKEN` in `.dev.vars` with the value from the GitHub Access Token.

#### GitHub Webhook

You'll need to [create a GitHub repository webhook](https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks#creating-a-repository-webhook) with the following settings:

![Webhook settings](assets/webhook.png)
![Webhook event](assets/webhook-event.png)

Update `GITHUB_WEBHOOK_SECRET` in `.dev.vars` with the value from the GitHub Webhook.

#### Secrets

Add `GITHUB_CLIENT_SECRET`, `GITHUB_ACCESS_TOKEN`, and `GITHUB_WEBHOOK_SECRET` to your Cloudflare Pages project as [encrypted secrets](https://developers.cloudflare.com/pages/functions/bindings/#secrets).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm run dev`             | Starts local dev server at `localhost:8788`      |
| `pnpm run build`           | Build your production site to `./dist/`          |
| `pnpm run preview`         | Preview your build locally, before deploying     |
| `pnpm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                     |
| `pnpm run smee`            | Start a local webhook proxy with [Smee.io](https://smee.io/) |
