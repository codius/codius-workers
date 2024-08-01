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
  REQUEST_UNIT_PRICE_NANO_USD: string
  TOTAL_REQUESTS_PER_UNIT: string

  // TODO: INCLUDED_MONTHLY_REQUESTS
  INCLUDED_REQUESTS: string
}

export type WorkerBilling = {
  requests: {
    total: bigint
    totalAllowed: bigint
  }
  funding: {
    totalNanoUSD: bigint
  }
  pricing: {
    unitPriceNanoUSD: bigint
    requestsPerUnit: bigint
    includedRequests: bigint
  }
}

const LIMIT_EXCEEDED_MESSAGE = "Request limit exceeded"

export function isLimitExceededError(error: unknown): boolean {
  return error instanceof Error && error.message === LIMIT_EXCEEDED_MESSAGE
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

  async getWorkerBilling(): Promise<WorkerBilling> {
    return {
      funding: {
        totalNanoUSD:
          (await this.ctx.storage.get<bigint>("totalFundingNanoUSD")) ?? 0n,
      },
      requests: {
        total: (await this.ctx.storage.get<bigint>("totalRequests")) ?? 0n,
        totalAllowed:
          (await this.ctx.storage.get("totalAllowedRequests")) ??
          BigInt(this.env.INCLUDED_REQUESTS),
      },
      pricing: {
        unitPriceNanoUSD: BigInt(this.env.REQUEST_UNIT_PRICE_NANO_USD),
        requestsPerUnit: BigInt(this.env.TOTAL_REQUESTS_PER_UNIT),
        includedRequests: BigInt(this.env.INCLUDED_REQUESTS),
      },
    }
  }

  async incrementWorkerRequests(): Promise<void> {
    let totalRequests =
      (await this.ctx.storage.get<bigint>("totalRequests")) ?? 0n
    const totalAllowedRequests =
      (await this.ctx.storage.get<bigint>("totalAllowedRequests")) ??
      BigInt(this.env.INCLUDED_REQUESTS)

    if (totalRequests >= totalAllowedRequests) {
      throw new Error(LIMIT_EXCEEDED_MESSAGE)
    }

    totalRequests++

    // You do not have to worry about a concurrent request having modified the value in storage.
    // "input gates" will automatically protect against unwanted concurrency.
    // Read-modify-write is safe.
    await this.ctx.storage.put("totalRequests", totalRequests)
  }

  async addWorkerFunds(amountNanoUSD: bigint): Promise<void> {
    let totalFundingNanoUSD =
      (await this.ctx.storage.get<bigint>("totalFundingNanoUSD")) ?? 0n
    totalFundingNanoUSD += amountNanoUSD
    await this.ctx.storage.put("totalFundingNanoUSD", totalFundingNanoUSD)

    const unitPriceNanoUSD = BigInt(this.env.REQUEST_UNIT_PRICE_NANO_USD)
    const requestsPerUnit = BigInt(this.env.TOTAL_REQUESTS_PER_UNIT)

    // Calculate the total allowed requests
    const totalAllowedRequests =
      BigInt(this.env.INCLUDED_REQUESTS) +
      (totalFundingNanoUSD * requestsPerUnit) / unitPriceNanoUSD
    await this.ctx.storage.put("totalAllowedRequests", totalAllowedRequests)
  }
}
