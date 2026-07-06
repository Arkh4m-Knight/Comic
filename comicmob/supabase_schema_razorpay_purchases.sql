-- Tracks Razorpay coin purchases end to end: order created -> payment
-- captured -> coins granted. The unique constraint on razorpay_order_id
-- is what makes granting idempotent -- both the webhook and the optional
-- instant client-side verification path check this table before calling
-- grant_coins(), so a payment can never be credited twice even if both
-- paths fire for the same order.

create table if not exists coin_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  amount_inr integer not null, -- rupees, not paise
  coins integer not null,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

alter table coin_purchases enable row level security;

-- Read-only for the owning user. No insert/update policy for anon/authenticated
-- at all -- every write goes through create_coin_purchase() or the webhook's
-- service-role client, never directly from the browser.
create policy "Users can view own coin purchases" on coin_purchases for select using (auth.uid() = user_id);

-- Called by the create-order API route (as the signed-in user) to record
-- a pending purchase before opening Razorpay Checkout. Runs as SECURITY
-- DEFINER since story writes here aren't otherwise permitted by RLS.
create or replace function create_coin_purchase(p_razorpay_order_id text, p_amount_inr integer, p_coins integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_signed_in';
  end if;

  insert into coin_purchases (user_id, razorpay_order_id, amount_inr, coins)
    values (v_user_id, p_razorpay_order_id, p_amount_inr, p_coins)
    returning id into v_id;

  return v_id;
end;
$$;

grant execute on function create_coin_purchase(text, integer, integer) to authenticated;

-- Marks a purchase paid and grants the coins, in one atomic step.
-- Idempotent: if this order was already marked 'paid', it's a no-op --
-- safe to call from both the webhook and the client-side verify route
-- without double-crediting.
create or replace function complete_coin_purchase(p_razorpay_order_id text, p_razorpay_payment_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase coin_purchases%rowtype;
begin
  select * into v_purchase from coin_purchases where razorpay_order_id = p_razorpay_order_id for update;

  if not found then
    return jsonb_build_object('success', false, 'reason', 'order_not_found');
  end if;

  if v_purchase.status = 'paid' then
    return jsonb_build_object('success', true, 'already_processed', true);
  end if;

  update coin_purchases
    set status = 'paid', razorpay_payment_id = p_razorpay_payment_id
    where id = v_purchase.id;

  update profiles set coin_balance = coin_balance + v_purchase.coins where id = v_purchase.user_id;
  insert into coin_transactions (user_id, amount, type) values (v_purchase.user_id, v_purchase.coins, 'purchase');

  return jsonb_build_object('success', true, 'coins', v_purchase.coins);
end;
$$;
-- Deliberately no GRANT EXECUTE -- only callable via the service role key,
-- from the webhook or the signature-verified server-side verify route.
