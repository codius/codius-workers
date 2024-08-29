import { ActionError, defineAction } from "astro:actions"
import { z } from "astro:schema"
import Stripe from "stripe"

export const checkoutSession = {
  create: defineAction({
    input: z.object({
      appId: z.string(),
    }),
    handler: async ({ appId }, context) => {
      const stripe = new Stripe(context.locals.runtime.env.STRIPE_SECRET_KEY)
      const { origin } = new URL(context.request.url)
      const metadata: Stripe.MetadataParam = {
        appId,
      }
      if (context.locals.user) {
        metadata.userId = context.locals.user.id
      }
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: context.locals.runtime.env.STRIPE_TOPUP_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "payment",
        // TODO: encrypt
        metadata,
        success_url: `${origin}/checkout-sessions/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${origin}?canceled=true`,
      })

      if (!session.url) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session.",
        })
      } else {
        return session.url
      }
    },
  }),
}
