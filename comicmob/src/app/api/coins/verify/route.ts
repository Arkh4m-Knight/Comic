import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/src/lib/supabase/server";
import { createServiceClient } from "@/src/lib/supabase/service";

// This is a UX nicety, not the source of truth -- it lets the coin balance
// update immediately after checkout instead of waiting for the webhook to
// arrive. The webhook (/api/webhooks/razorpay) is what actually guarantees
// coins get granted even if the browser closes right after payment; this
// route is safe to call in parallel because complete_coin_purchase() is
// idempotent on razorpay_order_id.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  // Only Razorpay (holder of the key secret) could have produced a
  // signature that matches order_id|payment_id -- this is what proves the
  // payment is real rather than a client just claiming success.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient.rpc("complete_coin_purchase", {
    p_razorpay_order_id: razorpay_order_id,
    p_razorpay_payment_id: razorpay_payment_id,
  });

  if (error || !data?.success) {
    return NextResponse.json({ error: "Couldn't finalize the purchase." }, { status: 500 });
  }

  return NextResponse.json({ success: true, coins: data.coins ?? 0 });
}
