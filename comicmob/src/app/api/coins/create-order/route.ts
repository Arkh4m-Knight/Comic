import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/src/lib/supabase/server";
import { getCoinPackage } from "@/src/lib/coin-packages";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to buy coins." }, { status: 401 });
  }

  const { packageId } = await req.json();
  const pkg = getCoinPackage(packageId);

  if (!pkg) {
    return NextResponse.json({ error: "Unknown coin package." }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Check back soon." },
      { status: 503 }
    );
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  let order;
  try {
    // Razorpay amounts are in the smallest currency unit (paise for INR).
    order = await razorpay.orders.create({
      amount: pkg.amountInr * 100,
      currency: "INR",
      notes: { user_id: userData.user.id, package_id: pkg.id, coins: String(pkg.coins) },
    });
  } catch (err: any) {
    // Log the full detail server-side (visible in Vercel function logs) --
    // Razorpay SDK errors carry a statusCode + error.description that
    // explain exactly what went wrong (auth failure, account restriction,
    // amount limits, etc.), which we don't want to expose raw to the client.
    console.error("Razorpay order creation failed:", JSON.stringify(err?.error ?? err));
    return NextResponse.json(
      { error: err?.error?.description || "Couldn't start the payment. Please try again in a moment." },
      { status: 502 }
    );
  }

  // Record the pending purchase before the client ever sees Razorpay
  // Checkout, so complete_coin_purchase() has something to match against
  // when the webhook (or the verify route) fires.
  const { error: rpcError } = await supabase.rpc("create_coin_purchase", {
    p_razorpay_order_id: order.id,
    p_amount_inr: pkg.amountInr,
    p_coins: pkg.coins,
  });

  if (rpcError) {
    return NextResponse.json({ error: "Couldn't start the purchase. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    coins: pkg.coins,
  });
}
