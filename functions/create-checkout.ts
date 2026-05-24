export async function onRequestPost(context: any) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  
  return new Response(JSON.stringify({ 
    hasKey: !!stripeKey,
    keyStart: stripeKey ? stripeKey.substring(0, 10) : "none"
  }), {
    status: 200, 
    headers: { "Content-Type": "application/json" }
  });
}
Commit, wait for Cloudflare to deploy, then test again!
