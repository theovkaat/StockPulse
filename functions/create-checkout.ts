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
pro:   "price_1TaXoeK8FVmLL7TIAevFam1j",
elite: "price_1TaXoyK8FVmLL7TIdy6dL330",    };
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

    const data: any = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Stripe error" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ url: data.url }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
