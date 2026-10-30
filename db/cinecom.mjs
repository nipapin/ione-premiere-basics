import { randomUUID } from 'node:crypto';
import { amount, utcDate } from './paypro-sales.mjs';
import { isSubscriptionActive, parseSubscriptionDate } from './subscription-date.mjs';

export async function saveReferralAttribution(db, userId, attribution) {
  if (attribution) {
    await db.query(`INSERT INTO odin_referral_attributions(user_id,referral,cid,attributed_at) VALUES($1,$2,$3,$4)
      ON CONFLICT(user_id) DO UPDATE SET referral=EXCLUDED.referral,cid=EXCLUDED.cid,attributed_at=EXCLUDED.attributed_at
      WHERE odin_referral_attributions.attributed_at <= EXCLUDED.attributed_at`,
    [userId, attribution.ref, attribution.cid, attribution.attributedAt]);
  }
  return (await db.query('SELECT referral,cid FROM odin_referral_attributions WHERE user_id=$1', [userId])).rows[0] || null;
}

export async function enqueueCinecomEvent(db, { key, user, type, plan, amountCents = 0, currency = 'USD', cid = null, occurredAt = new Date().toISOString() }) {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0 || !/^[A-Z]{3}$/.test(currency)) throw new Error('Invalid Cinecom event amount');
  const id = randomUUID();
  const body = JSON.stringify({ id, type, occurred_at: occurredAt, customer: { email: user.email, first_name: user.name || '' },
    plan, amount_cents: amountCents, currency, cid });
  await db.query(`INSERT INTO odin_cinecom_events(id,event_key,user_id,body) VALUES($1,$2,$3,$4) ON CONFLICT(event_key) DO NOTHING`, [id, key, user.user_id, body]);
}

export function hasPaidAccess(subscriptions, now = Date.now()) {
  return subscriptions.some(subscription => subscription.management_source !== 'manual' && !subscription.is_trial &&
    ['111867', '113886', '113887'].includes(String(subscription.product_id)) && isSubscriptionActive(subscription, now));
}

function paidAccessUntil(subscriptions) {
  const active = subscriptions.filter(subscription => hasPaidAccess([subscription]));
  if (active.some(subscription => String(subscription.product_id) === '113887')) return null;
  const dates = active.map(subscription => parseSubscriptionDate(subscription.next_charge_date)?.getTime()).filter(Number.isFinite);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
}

export function customField(order, name) {
  return Array.isArray(order.customFields)
    ? order.customFields.find(field => field.customFieldKey === name)?.customFieldValue
    : order.customFields?.[name];
}

/** Called inside the same user-locked transaction as the entitlement update. */
export async function recordCinecomPayment(db, user, order, rows, fields, hadPaidAccess) {
  const ipn = fields.IPN_TYPE_NAME;
  if (!['OrderCharged', 'SubscriptionChargeSucceed', 'TrialCharge', 'OrderRefunded', 'OrderPartiallyRefunded'].includes(ipn)) return;
  const checkoutId = customField(order, 'x-odin-attribution-id');
  const checkout = typeof checkoutId === 'string' && /^[0-9a-f-]{36}$/i.test(checkoutId)
    ? (await db.query('SELECT referral,cid FROM odin_referral_checkouts WHERE id=$1 AND user_id=$2', [checkoutId, user.user_id])).rows[0] : null;
  const saved = (await db.query('SELECT referral,cid FROM odin_referral_attributions WHERE user_id=$1', [user.user_id])).rows[0];
  for (const row of rows) {
    const item = order.orderItems.find(item => String(item.orderItemId) === row.orderItemId);
    const subscription = row.subscriptionId
      ? (await db.query('SELECT referral,cid FROM odin_referral_subscriptions WHERE subscription_id=$1', [row.subscriptionId])).rows[0] : null;
    // Existing subscription attribution wins over later browser visits. A new
    // subscription uses the snapshot taken when its checkout was opened.
    const attribution = subscription || checkout || (row.referral ? { referral: row.referral, cid: row.referral === saved?.referral ? saved.cid : null } : saved) || { referral: null, cid: null };
    if (row.subscriptionId && fields.IS_ON_TRIAL_PERIOD !== '1') {
      await db.query(`INSERT INTO odin_referral_subscriptions(subscription_id,user_id,referral,cid) VALUES($1,$2,$3,$4)
        ON CONFLICT(subscription_id) DO NOTHING`, [row.subscriptionId, user.user_id, attribution.referral, attribution.cid]);
    }
    await db.query(`INSERT INTO odin_referral_orders(order_id,order_item_id,user_id,referral,cid) VALUES($1,$2,$3,$4,$5)
      ON CONFLICT(order_id,order_item_id) DO NOTHING`, [row.orderId, row.orderItemId, user.user_id, attribution.referral, attribution.cid]);
    const original = (await db.query('SELECT * FROM odin_referral_orders WHERE order_id=$1 AND order_item_id=$2 FOR UPDATE', [row.orderId, row.orderItemId])).rows[0];
    if (String(original.user_id) !== String(user.user_id)) throw new Error('Cinecom order owner mismatch');
    const refundedCents = Math.round(row.refundedAmount * 100);
    const oldRefundedCents = Number(original.refunded_cents);
    const plan = { '111867': 'creator_monthly', '113886': 'creator_yearly', '113887': 'lifetime' }[String(row.productId)];
    if (original.referral === 'cinecom') {
      const common = { user, plan, currency: row.currency, cid: original.cid };
      if (['OrderCharged', 'SubscriptionChargeSucceed', 'TrialCharge'].includes(ipn) && ['processed', 'partiallyrefunded'].includes(row.status) && fields.IS_ON_TRIAL_PERIOD !== '1') {
        const paidAt = utcDate(item.dateCreated || order.createdAt);
        const amountCents = Math.round(amount(item.billingPrice) * 100);
        if (plan === 'lifetime') {
          await enqueueCinecomEvent(db, { ...common, key: `lifetime:${row.orderId}:${row.orderItemId}`, type: 'lifetime_purchased', amountCents, occurredAt: paidAt });
        } else {
          const state = (await db.query('SELECT * FROM odin_cinecom_access WHERE user_id=$1 FOR UPDATE', [user.user_id])).rows[0];
          const renewal = Number(item.subscriptionBillingCycle) > 1 ||
            (fields.SUBSCRIPTION_INITIAL_ORDER_ID && fields.SUBSCRIPTION_INITIAL_ORDER_ID !== String(row.orderId));
          // A monthly/yearly switch and ordinary renewal keep the same access.
          if (!renewal && !hadPaidAccess) {
            await enqueueCinecomEvent(db, { ...common, key: `creator:${row.subscriptionId || row.orderItemId}:started`, type: 'subscription_started', amountCents, occurredAt: paidAt });
          }
          const subscriptions = (await db.query('SELECT * FROM subscriptions WHERE user_id=$1', [user.user_id])).rows;
          // A retry of an old charge must not re-arm an already expired access
          // period and produce another cancellation on the next worker tick.
          if (hasPaidAccess(subscriptions)) {
            const generation = state ? state.generation + (state.active ? 0 : 1) : 1;
            await db.query(`INSERT INTO odin_cinecom_access(user_id,plan,currency,cid,active,generation,access_until) VALUES($1,$2,$3,$4,true,$5,$6)
              ON CONFLICT(user_id) DO UPDATE SET plan=EXCLUDED.plan,currency=EXCLUDED.currency,cid=EXCLUDED.cid,active=true,generation=EXCLUDED.generation,access_until=EXCLUDED.access_until,checked_at=NOW()`,
            [user.user_id, plan, row.currency, original.cid, generation, paidAccessUntil(subscriptions)]);
          }
          hadPaidAccess = true;
        }
      }
      // The authenticated order may already include a refund when an older
      // charge IPN is retried. Never consume that refund silently.
      if (refundedCents > oldRefundedCents) {
        await enqueueCinecomEvent(db, { ...common, key: `refund:${row.orderId}:${row.orderItemId}:${refundedCents}`, type: 'refunded', amountCents: refundedCents - oldRefundedCents });
      }
    }
    // Monotonic watermark prevents duplicate and out-of-order refund IPNs from
    // reporting the same refunded money more than once.
    await db.query('UPDATE odin_referral_orders SET refunded_cents=GREATEST(refunded_cents,$1) WHERE order_id=$2 AND order_item_id=$3', [refundedCents, row.orderId, row.orderItemId]);
  }
}

export async function reconcileCinecomAccess(db) {
  const states = (await db.query(`SELECT a.*,u.email,u.name FROM odin_cinecom_access a JOIN users u USING(user_id)
    WHERE a.active ORDER BY a.checked_at LIMIT 100 FOR UPDATE OF u,a SKIP LOCKED`)).rows;
  for (const state of states) {
    const subscriptions = (await db.query('SELECT * FROM subscriptions WHERE user_id=$1', [state.user_id])).rows;
    const active = hasPaidAccess(subscriptions);
    if (!active) {
      // Expiry is the actual loss time even if this worker was offline then.
      const expiry = state.access_until ? new Date(state.access_until).getTime() : null;
      const occurredAt = expiry !== null && expiry <= Date.now() ? new Date(expiry).toISOString() : new Date().toISOString();
      await enqueueCinecomEvent(db, { key: `creator:${state.user_id}:cancelled:${state.generation}`, user: state,
        type: 'subscription_cancelled', plan: state.plan, currency: state.currency, cid: state.cid, occurredAt });
    }
    await db.query('UPDATE odin_cinecom_access SET active=$1,access_until=$2,checked_at=NOW() WHERE user_id=$3', [active, active ? paidAccessUntil(subscriptions) : state.access_until, state.user_id]);
  }
}
