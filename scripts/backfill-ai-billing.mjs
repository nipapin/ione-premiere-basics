import pg from 'pg';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { loadDatabaseConfig } from '../db/config.mjs';
import { parseSubscriptionDate } from '../db/subscription-date.mjs';
import { normalizePayproOrder } from '../db/paypro-sales.mjs';

const providerDate = value => parseSubscriptionDate(typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) &&
  !/[zZ]$|[+-]\d\d:\d\d$/.test(value) ? `${value}Z` : value)?.toISOString() ?? null;
const paidStatuses = new Set(['processed','partiallyrefunded','chargebackwon','orderchargebackiswon']);
const revokedStatuses = new Set(['refunded','chargeback','chargedback']);
const isTestOrder = order => ['true','1'].includes(String(order.isTestMode).toLowerCase());
// Inspect real provider test orders without treating them as paid sales.
const backfillItems = order => normalizePayproOrder({...order,isTestMode:false});

/** Only sanitized provider dates leave this boundary; PayPro echoes credentials. */
export async function planBillingBackfill(subscription, request, {preserveLifetime=false}={}) {
  if (subscription.is_test || subscription.management_source === 'manual') return null;
  if (String(subscription.product_id) === '113887') {
    const data = await request('Orders/GetOrderDetails', { orderId: Number(subscription.order_id), dateFormat: 'a' });
    if (String(data.orderId) !== String(subscription.order_id)) throw new Error('Order mismatch');
    const isTest = isTestOrder(data);
    const items = backfillItems(data);
    const item = items.find(item => item.productId === 113887) ?? (preserveLifetime && !isTest
      ? items.find(item => [111867,113886].includes(item.productId) &&
        String(item.subscriptionId) === String(subscription.subscription_id)) : undefined);
    if (!item) throw new Error('Lifetime payment item missing');
    const manualLifetime = item.productId !== 113887;
    if(manualLifetime && (!paidStatuses.has(item.status) || item.grossAmount<=item.refundedAmount)) {
      throw new Error('Preserved Lifetime requires an explicitly approved confirmed purchase');
    }
    return { anchor: item.paidAt, paidAt: item.paidAt, paidUntil: null, orderId: item.orderId,
      confirmed: !isTest && paidStatuses.has(item.status) && item.grossAmount > item.refundedAmount,
      revoked: revokedStatuses.has(item.status), isTrial: false, isTest, manualLifetime };
  }
  const data = await request('Subscriptions/GetSubscriptionDetails', { subscriptionId: Number(subscription.subscription_id), dateFormat: 'a' });
  if (String(data.productId) !== String(subscription.product_id)) throw new Error('Subscription product mismatch');
  const anchor = providerDate(data.createdAt);
  const paidAt = providerDate(data.lastPayment);
  const paidUntil = providerDate(data.nextPayment);
  if (!anchor || (!data.isTrial && !paidAt)) throw new Error('Provider billing dates missing');
  const latest = [...(data.orders ?? [])].sort((a,b) =>
    Date.parse(providerDate(b.createdAt)) - Date.parse(providerDate(a.createdAt)) || Number(b.id)-Number(a.id))[0];
  if (!latest || !Number.isSafeInteger(Number(latest.id))) throw new Error('Latest provider order missing');
  const order = await request('Orders/GetOrderDetails', { orderId: Number(latest.id), dateFormat: 'a' });
  if (String(order.orderId) !== String(latest.id)) throw new Error('Order mismatch');
  const isTest=isTestOrder(order);
  const item = backfillItems(order).find(item => String(item.productId) === String(subscription.product_id) &&
    String(item.subscriptionId) === String(subscription.subscription_id));
  if (!item) throw new Error('Subscription payment item missing');
  return { anchor, paidAt, paidUntil, orderId: item.orderId,
    confirmed: !isTest && !data.isTrial && paidStatuses.has(item.status) && item.grossAmount > item.refundedAmount,
    revoked: Boolean(subscription.access_revoked_at) || revokedStatuses.has(item.status), isTrial: data.isTrial === true,
    isTest, manualLifetime:false };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const preserved=new Set(process.argv.slice(2).filter(arg=>/^--preserve-lifetime=\d+$/.test(arg)).map(arg=>Number(arg.split('=')[1])));
  if (process.argv.slice(2).some(arg => arg !== '--apply' && !/^--preserve-lifetime=\d+$/.test(arg))) {
    throw new Error('Usage: node scripts/backfill-ai-billing.mjs [--apply] [--preserve-lifetime=SUBSCRIPTION_ROW_ID]');
  }
  const pool = new pg.Pool({ ...loadDatabaseConfig(), max: 1, connectionTimeoutMillis: 10000, statement_timeout: 15000 });
  const credentials = { vendorAccountId: Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID), apiSecretKey: process.env.PAYPRO_API_SECRET_KEY };
  const request = async (method, args) => {
    const response = await fetch(`https://store.payproglobal.com/api/${method}`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...credentials, ...args }),
    });
    const data = await response.json();
    if (!response.ok || data.isSuccess !== true) throw new Error('Unable to read provider billing dates');
    return data.response;
  };
  try {
    const missing = Number((await pool.query('SELECT COUNT(*) AS count FROM users WHERE created_at IS NULL')).rows[0].count);
    if (missing) throw new Error(`${missing} accounts have no registration date; restore their actual dates before enabling AI`);
    const subscriptions = (await pool.query(`SELECT *,xmin::text AS row_version FROM subscriptions WHERE NOT is_test AND NOT management_lifetime_granted AND management_source='paypro'
      AND product_id IN (111867,113886,113887) ORDER BY id`)).rows;
    const plans = [];
    // Read and validate every provider response before applying any changes.
    for (const subscription of subscriptions) {
      plans.push({ subscription, plan: await planBillingBackfill(subscription, request, {preserveLifetime:preserved.has(Number(subscription.id))}) });
    }
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', subscriptions: plans.length,
      revoked: plans.filter(({ plan }) => plan.revoked).length, testOrders:plans.filter(({plan})=>plan.isTest).length,
      preservedLifetime:plans.filter(({plan})=>plan.manualLifetime).length, missingRegistrationDates: missing,
      updates: plans.map(({subscription,plan})=>({subscriptionId:String(subscription.subscription_id),...plan})) }));
    if (!apply) return;
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      await db.query("SELECT pg_advisory_xact_lock(hashtext('odin-ai-billing-backfill'))");
      let applied=0;
      for (const { subscription, plan } of plans) {
        // Do not overwrite a newer charge/refund arriving during the provider reads.
        const result=await db.query(`UPDATE subscriptions SET ai_billing_anchor=$1,
          ai_last_paid_at=$2,ai_paid_until=$3,ai_paid_order_id=$4,
          ai_billing_confirmed=$5,access_revoked_at=CASE WHEN $6 THEN COALESCE(access_revoked_at,NOW()) ELSE access_revoked_at END,
          is_trial=$7,is_test=CASE WHEN $10 THEN TRUE ELSE is_test END,
          management_lifetime_granted=CASE WHEN $11 THEN TRUE ELSE management_lifetime_granted END
          WHERE id=$8 AND xmin::text=$9
          AND order_id IS NOT DISTINCT FROM $12 AND next_charge_date IS NOT DISTINCT FROM $13
          AND product_id IS NOT DISTINCT FROM $14 RETURNING *`,
        [plan.anchor,plan.paidAt,plan.paidUntil,plan.orderId,plan.confirmed,plan.revoked,plan.isTrial,
          subscription.id,subscription.row_version,plan.isTest,plan.manualLifetime,
          subscription.order_id,subscription.next_charge_date,subscription.product_id]);
        applied+=result.rowCount;
        if(result.rowCount && (plan.isTest || plan.manualLifetime)) {
          await db.query(`INSERT INTO odin_motionflow_audit(user_id,actor,action,reason,before_state,after_state)
            VALUES($1,$2,$3,$4,$5,$6)`,[String(subscription.user_id),'codex:owner-approved-production-rollout',
            plan.manualLifetime?'subscription_preserve_lifetime':'subscription_classify_provider_test',
            plan.manualLifetime?'Owner explicitly approved preserving existing Lifetime despite original annual PayPro SKU'
              :'Owner approved trial allowance for historical orders confirmed as isTestMode=true by PayPro',
            JSON.stringify(subscription),JSON.stringify(result.rows[0])]);
        }
      }
      await db.query('COMMIT');
      console.log(JSON.stringify({applied,skippedConcurrentChanges:plans.length-applied}));
    } catch (error) { await db.query('ROLLBACK'); throw error; }
    finally { db.release(); }
  } finally { await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error('[ai-backfill]', error.message); process.exitCode = 1; });
}
