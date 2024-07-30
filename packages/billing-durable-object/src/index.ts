import { DurableObject } from "cloudflare:workers"

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Associate bindings declared in wrangler.toml with the TypeScript type system
 */
export interface Env {
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  MY_DURABLE_OBJECT: DurableObjectNamespace<BillingDurableObject>

  REQUEST_UNIT_PRICE_CENTS: string
  TOTAL_REQUESTS_PER_UNIT: string
}

export type WorkerBilling = {
  totalAllowedWorkerRequests: bigint
  totalWorkerRequests: bigint
  totalFundingCents: bigint
}

export class LimitExceededError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LimitExceededError"
  }
}

/** A Durable Object's behavior is defined in an exported Javascript class */
export class BillingDurableObject extends DurableObject {
  /**
   * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
   * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.toml
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  /**
   * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
   *  Object instance receives a request from a Worker via the same method invocation on the stub
   *
   * @returns The greeting to be sent back to the Worker
   */
  async sayHello(): Promise<string> {
    return `Hello, ${this.ctx.id}!`
  }

  async incrementWorkerRequests(): Promise<void> {
    let totalWorkerRequests: bigint =
      (await this.ctx.storage.get("totalWorkerRequests")) || 0n
    const totalAllowedWorkerRequests: bigint =
      (await this.ctx.storage.get("totalAllowedWorkerRequests")) || 0n

    if (totalWorkerRequests >= totalAllowedWorkerRequests) {
      throw new LimitExceededError("Request limit exceeded")
    }

    totalWorkerRequests++

    // You do not have to worry about a concurrent request having modified the value in storage.
    // "input gates" will automatically protect against unwanted concurrency.
    // Read-modify-write is safe.
    await this.ctx.storage.put("totalWorkerRequests", totalWorkerRequests)
  }

  async addWorkerFunds(amountCents: bigint): Promise<WorkerBilling> {
    let totalFundingCents: bigint =
      (await this.ctx.storage.get("totalFundingCents")) || 0n
    totalFundingCents += amountCents
    await this.ctx.storage.put("totalFundingCents", totalFundingCents)

    const unitPriceCents = BigInt(this.env.REQUEST_UNIT_PRICE_CENTS)
    const requestsPerUnit = BigInt(this.env.TOTAL_REQUESTS_PER_UNIT)

    // Calculate the total allowed requests
    const totalAllowedWorkerRequests =
      (totalFundingCents * requestsPerUnit) / unitPriceCents
    await this.ctx.storage.put(
      "totalAllowedWorkerRequests",
      totalAllowedWorkerRequests,
    )

    return {
      totalFundingCents,
      totalAllowedWorkerRequests,
      totalWorkerRequests:
        (await this.ctx.storage.get("totalWorkerRequests")) || 0n,
    }
  }

  // async deductMonthlyCost(): Promise<WorkerBilling> {
  // }
}
