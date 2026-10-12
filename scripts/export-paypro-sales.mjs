// Read-only provider export. No payments, subscriptions or production tables
// are changed. The output omits API keys and buyer contact details.
import nextEnv from '@next/env';
import pg from 'pg';
nextEnv.loadEnvConfig(process.cwd());
const pool = new pg.Pool({ host: process.env.HOST_URL, port: Number(process.env.HOST_PORT), user: process.env.HOST_NAME, password: process.env.HOST_PASS, database: process.env.HOST_DB });
const subscriptions = (await pool.query('SELECT id,user_id,order_id,subscription_id,product_id,status,next_charge_date,quantity,is_trial,affilate,management_source,management_disabled FROM subscriptions')).rows;
await pool.end();
async function api(method, args) {
  const response = await fetch('https://store.payproglobal.com/api/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000), body: JSON.stringify({ ...args, vendorAccountId: Number(process.env.PAYPRO_VENDOR_ACCOUNT_ID), apiSecretKey: process.env.PAYPRO_API_SECRET_KEY }) });
  const data = await response.json();
  if (!response.ok || !data.isSuccess) throw new Error('PayPro read failed: ' + method);
  return data.response;
}
const list = [];
for (let skip = 0; ; skip += 100) {
  const page = await api('Orders/GetList', { skip, take: 100, sortByDate: 'asc', includeTestOrders: false });
  list.push(...page.orders); if (list.length >= page.totalCount) break;
}
const orders = [], failures = []; let next = 0;
await Promise.all([0, 1, 2].map(async () => {
  while (next < list.length) {
    const id = list[next++].id;
    try {
      const row = await api('Orders/GetOrderDetails', { orderId: id, dateFormat: 'a' });
      orders.push({ orderId: row.orderId, orderStatusName: row.orderStatusName, createdAt: row.createdAt,
        billingCurrencyCode: row.billingCurrencyCode, balanceCurrencyCode: row.balanceCurrencyCode,
        balanceTotalPrice: row.balanceTotalPrice, balanceRefundedAmount: row.balanceRefundedAmount,
        isTestMode: row.isTestMode, customer: { customerId: row.customer?.customerId, email: `buyer-${row.customer?.customerId}@preview.invalid` },
        customFields: row.customFields?.filter(field => field.customFieldKey === 'x-odin-affiliate'),
        orderItems: row.orderItems?.map(item => ({ orderItemId: item.orderItemId, orderId: item.orderId,
          productId: item.productId, orderItemName: item.orderItemName, quantity: item.quantity,
          subscriptionId: item.subscriptionId, billingPrice: item.billingPrice, billingPriceRefund: item.billingPriceRefund,
          balanceVendorAmount: item.balanceVendorAmount, balancePayProAmount: item.balancePayProAmount, dateCreated: item.dateCreated })) });
    } catch { failures.push(id); }
  }
}));
console.log(JSON.stringify({ fetchedAt: new Date().toISOString(), subscriptions, orders, failures }));
