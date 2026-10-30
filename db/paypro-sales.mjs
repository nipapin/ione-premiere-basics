// Only fields needed by the sales report are retained. API request echoes, card
// details, addresses and license keys must never reach this table or the client.
export const odinProductIds = [111867, 113886, 113887];
export const paidStatuses = ['processed', 'refunded', 'partiallyrefunded', 'chargedback', 'chargeback', 'chargebackwon', 'orderchargebackiswon'];

export function amount(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value);
  if (!/^-?\d+(?:\.\d{1,8})?$/.test(text)) throw new Error('Invalid PayPro amount');
  const sign = text.startsWith('-') ? -1 : 1;
  const [whole, fraction = ''] = text.replace(/^-/, '').split('.');
  const cents = Number(whole) * 100 + Number((fraction + '00').slice(0, 2)) + (Number(fraction[2] || 0) >= 5 ? 1 : 0);
  if (!Number.isSafeInteger(cents)) throw new Error('Invalid PayPro amount');
  return sign * cents / 100;
}

export function utcDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) throw new Error('Invalid PayPro date');
  const day = value.slice(0, 10);
  if (!Number.isFinite(new Date(day).getTime()) || new Date(day).toISOString().slice(0, 10) !== day) throw new Error('Invalid PayPro date');
  const date = new Date(/[zZ]$|[+-]\d{2}:\d{2}$/.test(value) ? value : value + 'Z');
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid PayPro date');
  return date.toISOString();
}

export function normalizePayproOrder(order, referralBySubscription = new Map()) {
  if (['true', '1'].includes(String(order.isTestMode).toLowerCase())) return [];
  if (!Number.isSafeInteger(Number(order.orderId)) || Number(order.orderId) <= 0) throw new Error('Invalid order ID');
  const currency = String(order.billingCurrencyCode || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Invalid order currency');
  const balanceCurrency = order.balanceCurrencyCode?.toUpperCase() || null;
  if (balanceCurrency && !/^[A-Z]{3}$/.test(balanceCurrency)) throw new Error('Invalid balance currency');
  const status = String(order.orderStatusName || '').toLowerCase().replace(/[^a-z]/g, '');
  const customRef = (Array.isArray(order.customFields)
    ? order.customFields.find(field => field.customFieldKey === 'x-odin-affiliate')?.customFieldValue
    : order.customFields?.['x-odin-affiliate']) || null;
  const email = String(order.customer?.email || '');
  const buyerLabel = email.includes('@') ? `${email.slice(0, 1)}***@${email.split('@')[1]}` : 'Buyer';
  return (order.orderItems || []).filter(item => odinProductIds.includes(Number(item.productId))).map(item => {
    if (!Number.isSafeInteger(Number(item.orderItemId)) || Number(item.orderItemId) <= 0) throw new Error('Invalid order item ID');
    const gross = amount(item.billingPrice);
    if (gross === null || gross < 0) throw new Error('Missing or invalid paid amount');
    const chargeback = ['chargeback', 'chargedback'].includes(status);
    const refunded = chargeback || status === 'refunded' ? gross : Math.min(gross, amount(item.billingPriceRefund) ?? (status === 'refunded' ? gross : 0));
    if (refunded < 0) throw new Error('Invalid refunded amount');
    const fee = amount(item.balancePayProAmount);
    const net = amount(item.balanceVendorAmount);
    const subscriptionId = Number(item.subscriptionId) > 0 ? String(item.subscriptionId) : null;
    return {
      orderId: String(order.orderId), orderItemId: String(item.orderItemId), productId: Number(item.productId),
      subscriptionId, buyerKey: order.customer?.customerId ? `paypro:${order.customer.customerId}` : `order:${order.orderId}`,
      buyerLabel, plan: String(item.orderItemName || 'Odin Pro').slice(0, 200),
      referral: referralBySubscription.get(subscriptionId) || customRef,
      paidAt: utcDate(item.dateCreated || order.createdAt), status, quantity: Math.max(1, Math.trunc(Number(item.quantity) || 1)),
      currency, grossAmount: gross, refundedAmount: refunded, balanceCurrency,
      // Order-level settlement amounts can be attributed exactly to a single
      // item. Multi-item conversions stay unknown rather than being prorated.
      balanceGrossAmount: order.orderItems.length === 1 ? amount(order.balanceTotalPrice) : null,
      balanceRefundedAmount: order.orderItems.length === 1 ? (refunded === gross ? amount(order.balanceTotalPrice) : amount(order.balanceRefundedAmount)) : null,
      // These are the provider's actual balance amounts, including refund costs.
      // They can be negative; do not fabricate a conversion or fee formula.
      feeAmount: balanceCurrency ? fee : null,
      netAmount: balanceCurrency ? net : null,
    };
  });
}

export async function saveSales(executor, rows, source = 'paypro_api') {
  for (const row of rows) {
    if (row.referral && row.referral.length <= 200) {
      await executor.query('INSERT INTO odin_affiliate_links(code,label) VALUES($1,$2) ON CONFLICT(code) DO NOTHING', [row.referral, row.referral.slice(0, 80)]);
    }
    await executor.query(`INSERT INTO odin_sales(order_id,order_item_id,product_id,subscription_id,buyer_key,buyer_label,plan,referral,paid_at,status,quantity,currency,gross_amount,refunded_amount,balance_currency,fee_amount,net_amount,source,balance_gross_amount,balance_refunded_amount)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT(order_id,order_item_id) DO UPDATE SET
        referral=COALESCE(odin_sales.referral,EXCLUDED.referral),status=EXCLUDED.status,
        gross_amount=EXCLUDED.gross_amount,refunded_amount=EXCLUDED.refunded_amount,
        fee_amount=EXCLUDED.fee_amount,net_amount=EXCLUDED.net_amount,balance_currency=EXCLUDED.balance_currency,
        balance_gross_amount=EXCLUDED.balance_gross_amount,balance_refunded_amount=EXCLUDED.balance_refunded_amount,
        source=EXCLUDED.source,observed_at=now()`, [row.orderId,row.orderItemId,row.productId,row.subscriptionId,row.buyerKey,row.buyerLabel,row.plan,row.referral,row.paidAt,row.status,row.quantity,row.currency,row.grossAmount,row.refundedAmount,row.balanceCurrency,row.feeAmount,row.netAmount,source,row.balanceGrossAmount,row.balanceRefundedAmount]);
  }
}
