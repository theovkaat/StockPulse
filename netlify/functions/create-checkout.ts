import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { statusCode: 500, body: JSON.stringify({ error: "Stripe key not configured" }) };

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as any });

    const { planId, email, userId } = JSON.parse(event.body || "{}");
    if (!planId || !email || !userId) return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };

    const PRICE_IDS: Record<string, string> = {
      pro:   "price_1TaBfWK8FVmLL7TIcrmqf7Oq",
      elite: "price_1TaBg6K8FVmLL7TIiJ4w3On9",
    };

    const priceId = PRICE_IDS[planId];
    if (!priceId) return { statusCode: 400, body: JSON.stringify({ error: "Invalid plan" }) };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://stockpulse.fit/?upgraded=${planId}`,
      cancel_url: `https://stockpulse.fit/?cancelled=true`,
      metadata: { userId, planId },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};

export { handler };
