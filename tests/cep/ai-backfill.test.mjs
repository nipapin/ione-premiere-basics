import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planBillingBackfill} from '../../scripts/backfill-ai-billing.mjs';

function fixture(productId=111867,status='Processed') {
  const sub={product_id:productId,subscription_id:123,order_id:41,management_source:'paypro'};
  const order={orderId:42,orderStatusName:status,createdAt:'2026-10-23T08:00:00',billingCurrencyCode:'USD',
    customer:{customerId:1,email:'backfill@odin-test.invalid'},orderItems:[{orderItemId:420,productId,
      subscriptionId:productId===113887?0:123,billingPrice:20,billingPriceRefund:status==='Refunded'?20:0,quantity:1}]};
  if(productId===113887)sub.order_id=42;
  const details={productId,createdAt:'2025-01-23T08:00:00',lastPayment:'2026-10-23T08:00:00',
    nextPayment:'2026-11-23T08:00:00',isTrial:false,orders:[{id:42,createdAt:order.createdAt},{id:41,createdAt:'2025-01-23T08:00:00'}]};
  const request=async(method,args)=>{
    if(method==='Subscriptions/GetSubscriptionDetails')return details;
    assert.equal(args.orderId,42);return order;
  };
  return {sub,order,details,request};
}
test('backfill uses verified original purchase and latest order, with provider dates interpreted as UTC',async()=>{
  const f=fixture();const plan=await planBillingBackfill(f.sub,f.request);
  assert.equal(plan.anchor,'2025-01-23T08:00:00.000Z');
  assert.equal(plan.paidAt,'2026-10-23T08:00:00.000Z');
  assert.equal(String(plan.orderId),'42');assert.equal(plan.confirmed,true);
});
test('historical full refunds and chargebacks never become paid during backfill',async()=>{
  for(const product of [111867,113887])for(const status of ['Refunded','ChargedBack','Pending']){
    const f=fixture(product,status);const plan=await planBillingBackfill(f.sub,f.request);
    assert.equal(plan.confirmed,false);assert.equal(plan.revoked,status!=='Pending');
  }
});
test('mismatched orders and products abort backfill instead of granting credits',async()=>{
  const f=fixture();f.order.orderItems[0].subscriptionId=999;
  await assert.rejects(()=>planBillingBackfill(f.sub,f.request),/payment item missing/);
  f.details.productId=999;
  await assert.rejects(()=>planBillingBackfill(f.sub,f.request),/product mismatch/);
});
test('verified PayPro test orders are classified without paid quota even when legacy DB flags were missing',async()=>{
  for(const product of [111867,113887]){
    const f=fixture(product);f.order.isTestMode=true;
    const plan=await planBillingBackfill(f.sub,f.request);
    assert.equal(plan.isTest,true);assert.equal(plan.confirmed,false);
  }
});
test('preserving a legacy Lifetime requires an explicit override and a confirmed matching real purchase',async()=>{
  const f=fixture(113887);f.order.orderItems[0].productId=113886;f.order.orderItems[0].subscriptionId=123;
  await assert.rejects(()=>planBillingBackfill(f.sub,f.request),/Lifetime payment item missing/);
  const plan=await planBillingBackfill(f.sub,f.request,{preserveLifetime:true});
  assert.equal(plan.manualLifetime,true);assert.equal(plan.confirmed,true);assert.equal(plan.paidUntil,null);
  f.order.isTestMode=true;
  await assert.rejects(()=>planBillingBackfill(f.sub,f.request,{preserveLifetime:true}),/Lifetime payment item missing/);
});
