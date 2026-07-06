import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/src/lib/supabase/service";

// Configure this exact URL in Razorpay Dashboard -> Settings -> Webhooks,
// subscribed to the "payment.captured" event, using the same secret as
// RAZORPAY_WEBHOOK_SECRET below.
//
// This is the authoritative granting path -- unlike /api/coins/verify
// (which trusts a signature the browser hands back after checkout), this
// endpoint is called directly by Razorpay's servers, so it's the one path
// that doesn't depend on the customer's browser staying open or behaving.
// complete_coin_purchase() is idempotent, so it's safe for both this route
// and /api/coins/verify to fire for the same payment.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id) {
      const serviceClient = createServiceClient();
      await serviceClient.rpc("complete_coin_purchase", {
        p_razorpay_order_id: payment.order_id,
        p_razorpay_payment_id: payment.id,
      });
    }
  }

  // Always 200 on a verified, handled request -- Razorpay retries on
  // non-2xx responses, and there's nothing to retry once we've either
  // granted the coins or determined the event isn't one we act on.
  return NextResponse.json({ received: true });
}
