import { nanoid } from "./utils"
import { D1QB, JoinTypes } from "workers-qb"

type CreatePaymentOptions = {
  appId: string
  userId: string
  amount: number
  stripeCheckoutSessionId: string
}

type PaymentOptions = {
  id: string
  userId: string
}

type Payment = {
  id: string
  appId: string
  userId: string
  amount: number
  stripeCheckoutSessionId: string
  createdAt: string
  updatedAt: string
}

const tableName = "payments"

export class Payments {
  private qb: D1QB
  constructor(d1: D1Database) {
    this.qb = new D1QB(d1)
  }

  async create(options: CreatePaymentOptions) {
    const { results: app } = await this.qb
      .insert<App>({
        tableName,
        data: {
          id: nanoid(),
          ...options,
        },
        returning: "*",
      })
      .execute()
    return app
  }

  async getByUserId(userId: string) {
    const { results } = await this.qb
      .fetchAll<Payment>({
        tableName,
        where: {
          conditions: "userId = ?1",
          params: [userId],
        },
      })
      .execute()
    return results
  }

  async get({ id, userId }: PaymentOptions) {
    const { results } = await this.qb
      .fetchOne<Payment>({
        tableName,
        where: {
          conditions: ["id = ?1", "userId = ?2"],
          params: [id, userId],
        },
      })
      .execute()
    return results
  }
}
