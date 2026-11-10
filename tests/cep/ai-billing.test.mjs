import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { accounts,createOdinDatabase,seedOdinAccounts } from './fixtures/odin.mjs';
import { sourceLoader } from './fixtures/load-source.mjs';

async function billingFixture(t) {
  const f=await seedOdinAccounts(await createOdinDatabase());t.after(()=>f.close());
  const oldFetch=globalThis.fetch,oldKey=process.env.PAYPRO_VALIDATION_KEY;
  process.env.PAYPRO_VALIDATION_KEY='isolated-webhook-key';
  t.after(()=>{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.PAYPRO_VALIDATION_KEY;else process.env.PAYPRO_VALIDATION_KEY=oldKey;});
  const orders=new Map();let nextPayment='2027-01-23T08:00:00Z';let failProvider=false;
  globalThis.fetch=async(url,options)=>{
    if(url==='https://api.get-atomx.com/atomx/v1/webhook_esubs')return Response.json({});
    if(failProvider)throw new Error('Simulated provider outage');
    const body=JSON.parse(options.body);
    if(url.endsWith('/Orders/GetOrderDetails'))return Response.json({isSuccess:true,response:orders.get(String(body.orderId))});
    if(url.endsWith('/Subscriptions/GetSubscriptionDetails'))return Response.json({isSuccess:true,response:{status:'Active',nextPayment}});
    throw new Error('Unexpected external request');
  };
  const load=sourceLoader({
    '@/app/database/pool':{pool:f.pool},
    '@/app/database/postgre':{query:async(sql,args)=>(await f.pool.query(sql,args)).rows},
    '@/lib/email':{sendEmail:async()=>{}},
  });
  const route=load('@/app/api/payment/route');
  const notify=async(id,event='OrderCharged',extra={})=>{
    const order=orders.get(String(id));const item=order.orderItems[0];
    const fields={TEST_MODE:'0',IPN_TYPE_NAME:event,ORDER_ID:String(id),ORDER_ITEM_ID:String(item.orderItemId),
      PRODUCT_ID:String(item.productId),PRODUCT_QUANTITY:'1',SUBSCRIPTION_ID:String(item.subscriptionId||''),
      SUBSCRIPTION_NEXT_CHARGE_DATE:'2099-01-01',CUSTOMER_EMAIL:accounts.trial.email,CUSTOMER_ID:'1',ORDER_ITEM_NAME:'Odin Pro',
      IS_ON_TRIAL_PERIOD:'0',ORDER_STATUS:order.orderStatusName,ORDER_TOTAL_AMOUNT:'20',ORDER_CUSTOM_FIELDS:'',...extra};
    fields.SIGNATURE=createHash('sha256').update([fields.ORDER_ID,fields.ORDER_STATUS,fields.ORDER_TOTAL_AMOUNT,fields.CUSTOMER_EMAIL,
      process.env.PAYPRO_VALIDATION_KEY,fields.TEST_MODE,fields.IPN_TYPE_NAME].join('')).digest('hex');
    return route.POST(new Request('https://odin-test.invalid/api/payment',{method:'POST',body:new URLSearchParams(fields)}));
  };
  const addOrder=(id,paidAt='2026-11-23T08:00:00Z',productId=111867)=>{
    const order={orderId:id,orderStatusName:'Processed',createdAt:paidAt,billingCurrencyCode:'USD',isTestMode:false,
      customer:{customerId:1,email:accounts.trial.email},orderItems:[{orderItemId:id*10,productId,
        subscriptionId:productId===113887?0:12345,orderItemName:'Odin Pro',billingPrice:20,billingPriceRefund:0,quantity:1}]};
    orders.set(String(id),order);return order;
  };
  return {...f,route,notify,addOrder,setNext:value=>{nextPayment=value;},failProvider:value=>{failProvider=value;},
    current:async()=>(await f.db.query('SELECT * FROM subscriptions WHERE user_id=$1',[accounts.trial.id])).rows[0]};
}

test('verified initial charge stores provider period; forged client/provider-body dates cannot extend it',async t=>{
  const f=await billingFixture(t);f.addOrder(200,'2026-10-23T08:00:00Z');
  assert.equal((await f.notify(200)).status,200);
  const sub=await f.current();assert.equal(sub.ai_billing_confirmed,true);
  assert.equal(new Date(sub.ai_last_paid_at).toISOString(),'2026-10-23T08:00:00.000Z');
  assert.equal(sub.next_charge_date,'2027-01-23T08:00:00.000Z');
  assert.notEqual(sub.next_charge_date,'2099-01-01');
});
test('duplicate and older charge notifications never refill or roll back a billing period',async t=>{
  const f=await billingFixture(t);f.addOrder(200,'2026-10-23T08:00:00Z');await f.notify(200);
  const first=await f.current();await f.notify(200);assert.deepEqual(await f.current(),first);
  f.addOrder(201,'2026-11-23T08:00:00Z');f.setNext('2026-12-23T08:00:00Z');await f.notify(201,'SubscriptionChargeSucceed');
  const renewed=await f.current();assert.notEqual(String(renewed.ai_paid_order_id),String(first.ai_paid_order_id));
  await f.notify(200);assert.deepEqual(await f.current(),renewed);
});
test('full refund and chargeback revoke paid access; duplicate/replayed charges do not restore it',async t=>{
  for(const event of ['OrderRefunded','OrderChargedBack']){
    const f=await billingFixture(t);const order=f.addOrder(200,'2026-10-23T08:00:00Z');await f.notify(200);
    order.orderStatusName=event==='OrderRefunded'?'Refunded':'ChargedBack';order.orderItems[0].billingPriceRefund=20;
    assert.equal((await f.notify(200,event)).status,200);
    assert.ok((await f.current()).access_revoked_at);
    const profile=await f.auth.profile({id:'device',user_id:accounts.trial.id});
    assert.equal(profile.subscription.active,false);assert.equal(profile.entitlements.ai_generations_limit,5);
    await f.notify(200);assert.ok((await f.current()).access_revoked_at);
  }
});
test('cancellation keeps the paid-through date, and an old-order refund cannot revoke a newer paid period',async t=>{
  const f=await billingFixture(t);const old=f.addOrder(200,'2026-09-23T08:00:00Z');await f.notify(200);
  f.addOrder(201,'2026-10-23T08:00:00Z');await f.notify(201,'SubscriptionChargeSucceed');
  const paid=await f.current();await f.notify(201,'SubscriptionFinished',{SUBSCRIPTION_NEXT_CHARGE_DATE:''});
  assert.equal((await f.current()).next_charge_date,paid.next_charge_date);
  old.orderStatusName='Refunded';old.orderItems[0].billingPriceRefund=20;await f.notify(200,'OrderRefunded');
  assert.equal((await f.current()).access_revoked_at,null);
});
test('invalid signature, provider failure and unconfirmed license notifications cannot create paid credits',async t=>{
  const f=await billingFixture(t);f.addOrder(200,'2026-10-23T08:00:00Z');
  const bad=await f.route.POST(
    new Request('https://odin-test.invalid/api/payment',{method:'POST',body:'TEST_MODE=0&IPN_TYPE_NAME=OrderCharged&SIGNATURE=invalid'}));
  assert.equal(bad.status,503);assert.equal(await f.current(),undefined);
  f.failProvider(true);assert.equal((await f.notify(200)).status,503);assert.equal(await f.current(),undefined);
  f.failProvider(false);assert.equal((await f.notify(200,'LicenseRequested')).status,200);
  assert.equal((await f.current()).ai_billing_confirmed,false);
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.trial.id})).entitlements.ai_generations_limit,5);
});

test('a discounted confirmed purchase still grants the full paid allowance',async t=>{
  const f=await billingFixture(t);const order=f.addOrder(200,'2026-10-23T08:00:00Z');
  order.orderItems[0].billingPrice=1.99;
  await f.notify(200);
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.trial.id})).entitlements.ai_generations_limit,100);
});

test('a verified monthly-to-annual change uses the new purchase anchor and monthly subperiods',async t=>{
  const f=await billingFixture(t);f.addOrder(200,'2026-10-23T08:00:00Z');await f.notify(200);
  f.addOrder(201,'2026-11-09T08:00:00Z',113886);f.setNext('2027-11-09T08:00:00Z');
  assert.equal((await f.notify(201,'SubscriptionChargeSucceed')).status,200);
  const profile=await f.auth.profile({id:'device',user_id:accounts.trial.id});
  assert.equal(profile.entitlements.ai_generations_limit,100);
  assert.equal(profile.entitlements.ai.period_end,'2026-12-09T08:00:00.000Z');
  assert.equal(String((await f.current()).product_id),'113886');
});

test('a verified won chargeback restores the original period rather than minting a new one',async t=>{
  const f=await billingFixture(t);const order=f.addOrder(200,'2026-10-23T08:00:00Z');await f.notify(200);
  const before=await f.auth.profile({id:'device',user_id:accounts.trial.id});
  order.orderStatusName='ChargedBack';await f.notify(200,'OrderChargedBack');
  order.orderStatusName='ChargebackWon';await f.notify(200,'OrderChargebackIsWon');
  const after=await f.auth.profile({id:'device',user_id:accounts.trial.id});
  assert.equal(after.subscription.active,true);assert.equal(after.entitlements.ai.period_id,before.entitlements.ai.period_id);
});
test('an owner-approved manual Lifetime gift is preserved when its original PayPro plan sends updates',async t=>{
  const f=await billingFixture(t);f.addOrder(200,'2026-10-23T08:00:00Z');await f.notify(200);
  await f.db.query('UPDATE subscriptions SET product_id=113887,management_lifetime_granted=true,ai_paid_until=NULL,next_charge_date=$1 WHERE user_id=$2',['',accounts.trial.id]);
  const before=await f.current();const order=f.addOrder(201,'2026-11-09T08:00:00Z');
  await f.notify(201,'SubscriptionChargeSucceed');assert.deepEqual(await f.current(),before);
  order.orderStatusName='Refunded';await f.notify(201,'OrderRefunded');assert.deepEqual(await f.current(),before);
});
