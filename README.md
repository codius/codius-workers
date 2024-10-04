# Codius Workers

Attested hosting for [Cloudflare Workers](https://developers.cloudflare.com/workers/).

## :jigsaw: Packages

- [`codius-astro`](./packages/codius-astro) - [Astro](https://astro.build/) site for managing  workers
- [`dispatch-worker`](./packages/dispatch-worker) - [Workers for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/)[^1] [dynamic dispatch worker](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/how-workers-for-platforms-works/#dynamic-dispatch-worker)
- [`billing-durable-object`](./packages/billing-durable-object) - [Durable Object](https://developers.cloudflare.com/durable-objects/) for worker billing

[^1]: Workers for Platforms requires a [Paid plan](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/platform/pricing/).

## :wrench: Setup

### Install dependencies

```bash
pnpm install
```

## Flows

### Worker deployment

```mermaid
sequenceDiagram
    actor User
    box Cloudflare
        participant Astro
        participant Action as Astro Action (Worker)
        participant D1
        participant Workers as Workers for Platforms
    end
    box GitHub
        participant GitHub as GitHub Actions
        participant Repo as GitHub app repo
    end

    User->>+Astro: worker app info formdata
    Astro->>+Action: app info
    Action->>D1: INSERT app
    Action-x+GitHub: trigger workflow
    GitHub->>+Repo: git checkout
    Repo-->>-GitHub: repo
    GitHub->>+Workers: wrangler deploy --namespace
    Action-->>-Astro: app
    Astro-->>-User: app
```

### Worker request

```mermaid
sequenceDiagram
    actor User
    box Cloudflare
        participant Dispatch as Dispatch Worker
        participant DO as Billing Durable Object
        participant Worker
    end

    User->>+Dispatch: GET <id>.codius-workers.pages.dev
    Dispatch->>+DO: billing.incrementWorkerRequests()
    alt insufficient balance
        DO->>Dispatch: throw new Error(LIMIT_EXCEEDED_MESSAGE)
    else
        DO->>-Dispatch: OK
        Dispatch->>+Worker: userWorker.fetch(request)
        deactivate Dispatch
        Worker-->>-User: 200 resp
    end
```

### Worker billing

```mermaid
sequenceDiagram
    actor User
    box Cloudflare
        participant Astro
        participant Action as Astro Action (Worker)
        participant DO as Billing Durable Object
    end
    box Stripe
        participant StripeAPI as Stripe API
        participant Checkout
    end

    activate User
    User->>+Astro: clicks "Top Up" button
    Astro->>+Action: actions.checkoutSession.create

    Action->>+StripeAPI: stripe.checkout.sessions.create
    StripeAPI-->>-Action: session
    Action-->>-Astro: session.url
    Astro->>+Checkout: Navigate to session URL
    deactivate Astro
    Checkout-xUser: payment page
    User->>Checkout: payment info
    Checkout->>+Astro: Navigate to success url
    deactivate Checkout
    Astro->>+DO: billing.addWorkerFunds
    Astro-->>-User: success page

    deactivate User
```