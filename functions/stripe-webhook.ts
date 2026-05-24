export async function onRequestPost(context: any) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  const webhookSecret = context.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = context.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret) {
    return new Response("Missing Stripe configuration", { status: 500 });
  }

  try {
    const body = await context.request.text();
    const signature = context.request.headers.get("stripe-signature") || "";

    // Verify Stripe webhook signature manually
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, planId } = session.metadata || {};

      if (userId && planId && supabaseUrl && supabaseServiceKey) {
        // Update user plan in Supabase
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({ plan: planId }),
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Get customer email from Stripe
      const customerResp = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: { "Authorization": `Bearer ${stripeKey}` },
      });
      const customer: any = await customerResp.json();

      if (customer.email && supabaseUrl && supabaseServiceKey) {
        // Downgrade to free
        await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${customer.email}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({ plan: "free" }),
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const parts = signature.split(",").reduce((acc: Record<string, string>, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts["t"];
    const expectedSig = parts["v1"];

    if (!timestamp || !expectedSig) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

    return computed === expectedSig;
  } catch {
    return false;
  }
}
