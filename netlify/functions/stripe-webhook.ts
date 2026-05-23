import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const handler: Handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent: Stripe.Event;

  try {
    if (!webhookSecret || !sig) throw new Error("Missing webhook secret or signature");
    stripeEvent = stripe.webhooks.constructEvent(event.body || "", sig, webhookSecret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${String(err)}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const { userId, planId } = session.metadata || {};

    if (userId && planId) {
      await supabase.from("profiles").update({ plan: planId }).eq("id", userId);
    }
  }

  if (stripeEvent.type === "customer.subscription.deleted") {
    const subscription = stripeEvent.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    // Downgrade to free when subscription is cancelled
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (customer.email) {
      await supabase.from("profiles").update({ plan: "free" }).eq("email", customer.email);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

export { handler };
