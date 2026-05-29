export async function onRequestPost(context: any) {
  const resendKey = context.env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500 });
  }

  try {
    const body = await context.request.json();
    
    // Handle both Supabase webhook format and Make format
    let email: string;
    let name: string;
    
    if (body.record) {
      // Supabase webhook format: { type: "INSERT", table: "users", record: { email, ... } }
      email = body.record.email;
      name = body.record.raw_user_meta_data?.name || email?.split("@")[0] || "there";
    } else {
      // Make format: { email, name }
      email = body.email;
      name = body.name || email?.split("@")[0] || "there";
    }

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), { status: 400 });
    }

    const firstName = name.split(" ")[0];

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#07090f;color:#f1f5f9;padding:40px;border-radius:16px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:40px;margin-bottom:8px;">&#9672;</div>
    <h1 style="color:#3b82f6;font-size:28px;margin:0;">Welcome to StockPulse!</h1>
  </div>
  <p style="color:#94a3b8;font-size:16px;line-height:1.6;">Hi ${firstName},</p>
  <p style="color:#94a3b8;font-size:16px;line-height:1.6;">Your portfolio tracker is ready. Here is how to get started:</p>
  <div style="background:#111827;border-radius:12px;padding:24px;margin:24px 0;">
    <p style="margin:8px 0;color:#f1f5f9;">&#128202; Add your first stock in the Portfolio tab</p>
    <p style="margin:8px 0;color:#f1f5f9;">&#128276; Set a price alert when targets are hit</p>
    <p style="margin:8px 0;color:#f1f5f9;">&#128176; Check your dividend income</p>
    <p style="margin:8px 0;color:#f1f5f9;">&#129302; Try AI analysis - 3 free tries included</p>
    <p style="margin:8px 0;color:#f1f5f9;">&#128193; Import from DEGIRO or Lynx via CSV</p>
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="https://stockpulse.fit" style="background:#3b82f6;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">Open StockPulse &rarr;</a>
  </div>
  <p style="color:#64748b;text-align:center;font-size:13px;">Questions? Email <a href="mailto:support@stockpulse.fit" style="color:#3b82f6;">support@stockpulse.fit</a></p>
</div>
</body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "StockPulse <hello@stockpulse.fit>",
        to: [email],
        subject: "Welcome to StockPulse! \uD83D\uDE80",
        html,
      }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || "Resend error" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
