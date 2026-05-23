import type { Handler } from "@netlify/functions";

const PRICE_IDS: Record<string, string> = {
  pro:   "price_1TaBfWK8FVmLL7TIcrmqf7Oq",
  elite: "price_1TaBg6K8FVmLL7TIiJ4w3On9",
};

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe key not configured" }) };
  }

  let planId: string, email: string, userId: string;
  try {
    const body = JSON.parse(event.body || "{}");
    planId = body.planId;
    email = body.email;
    userId = body.userId;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!planId || !email || !userId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing planId, email or userId" }) };
  }

  const priceId = PRICE_IDS[planId];
  if (!priceId) {
    return { statusCode: 400, body: JSON.stringify({ error: `Invalid plan: ${planId}` }) };
  }

  try {
    // Use fetch directly to call Stripe API — no SDK needed
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("customer_email", email);
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `https://stockpulse.fit/?upgraded=${planId}`);
    params.append("cancel_url", "https://stockpulse.fit/?cancelled=true");
    params.append("metadata[userId]", userId);
    params.append("metadata[planId]", planId);
    params.append("payment_method_types[0]", "card");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json() as { url?: string; error?: { message: string } };

    if (!response.ok) {
      console.error("Stripe error:", data);
      return { statusCode: 500, body: JSON.stringify({ error: data.error?.message || "Stripe error" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: data.url }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};

export { handler };
