export async function onRequestPost(context: any) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Stripe key not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { planId, email, userId } = await context.request.json();
    if (!planId || !email || !userId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const PRICE_IDS: Record<string, string> = {
      pro:   "price_1TaBfWK8FVmLL7TIcrmqf7Oq",
      elite: "price_1TaBg6K8FVmLL7TIiJ4w3On9",
    };

    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      return new Response(JSON.stringify({ error: `Invalid plan: ${planId}` }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("customer_email", email);
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `https://stockpulse.fit/?upgraded=${planId}`);
    params.append("cancel_url", "https://stockpulse.fit/?cancelled=true");
    par
