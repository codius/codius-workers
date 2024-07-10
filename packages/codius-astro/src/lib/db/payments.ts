import { payments } from "./schema"
import * as schema from "./schema"
import { eq, and } from "drizzle-orm"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"

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

export class Payments {
  private db: DrizzleD1Database<typeof schema>
  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema })
  }

  async create(options: CreatePaymentOptions) {
    const [payment] = await this.db.insert(payments).values(options).returning()
    return payment
  }

  async getByUserId(userId: string) {
    return this.db.query.payments.findMany({
      where: eq(payments.userId, userId),
    })
  }

  async get({ id, userId }: PaymentOptions) {
    return this.db.query.payments.findFirst({
      where: and(eq(payments.id, id), eq(payments.userId, userId)),
    })
  }
}
