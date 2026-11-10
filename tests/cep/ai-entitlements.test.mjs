import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accounts,createOdinDatabase,seedOdinAccounts,signInDevice } from './fixtures/odin.mjs';
import { createOdinSubscriptionManagement } from '../../src/lib/odin-subscription-management.ts';
import { randomUUID } from 'node:crypto';

test('real account/device/profile flow grants 100 to owners and Seats and 5 to unpaid/expired accounts', async t => {
  const fixture=await seedOdinAccounts(await createOdinDatabase()); t.after(()=>fixture.close());
  for(const name of ['paid','seat','trial','expired','admin']) {
    const {profile}=await signInDevice(fixture,name);
    const paid=['paid','seat'].includes(name);
    assert.equal(profile.entitlements.ai_generations_limit,paid?100:5);
    assert.equal(profile.subscription.active,paid);
    assert.equal(profile.entitlements.ai.plan,paid?'paid':'trial');
    assert.ok(profile.entitlements.ai.period_id);
  }
  const owner=await fixture.auth.profile({id:'device',user_id:accounts.paid.id});
  const seat=await fixture.auth.profile({id:'device',user_id:accounts.seat.id});
  assert.equal(owner.entitlements.ai.period_id,seat.entitlements.ai.period_id);
  assert.notEqual(owner.user.id,seat.user.id);
});

test('cancellation retains paid access until expiry; expiry/refund/chargeback select the registration-based trial quota',async t=>{
  const f=await seedOdinAccounts(await createOdinDatabase());t.after(()=>f.close());
  const profile=()=>f.auth.profile({id:'device',user_id:accounts.paid.id});
  await f.db.query("UPDATE subscriptions SET status='cancelled',finished=true WHERE user_id=$1",[accounts.paid.id]);
  assert.equal((await profile()).entitlements.ai_generations_limit,100);
  await f.db.query("UPDATE subscriptions SET access_revoked_at=NOW() WHERE user_id=$1",[accounts.paid.id]);
  const after=await profile();
  assert.equal(after.subscription.active,false);assert.equal(after.entitlements.ai_generations_limit,5);
  assert.equal(new Date(after.entitlements.ai.period_end).getUTCDate(),23);
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.seat.id})).entitlements.ai_generations_limit,5);
});

test('device revocation, expiration and cross-account device mutations are enforced by the real account service',async t=>{
  const f=await seedOdinAccounts(await createOdinDatabase());t.after(()=>f.close());
  const paid=await signInDevice(f,'paid');
  assert.equal(await f.auth.revoke(accounts.trial.id,paid.identity.id),false);
  assert.ok(await f.auth.authenticate(`Bearer ${paid.token}`));
  await f.auth.revoke(accounts.paid.id,paid.identity.id);
  assert.equal(await f.auth.authenticate(`Bearer ${paid.token}`),null);
  const free=await signInDevice(f,'trial');
  await f.db.query("UPDATE odin_cep_devices SET expires_at=NOW()-INTERVAL '1 second' WHERE id=$1",[free.identity.id]);
  assert.equal(await f.auth.authenticate(`Bearer ${free.token}`),null);
});

test('unconfirmed/trial payment rows cannot grant a paid profile or a 100-credit allowance',async t=>{
  const f=await seedOdinAccounts(await createOdinDatabase());t.after(()=>f.close());
  await f.db.query("UPDATE subscriptions SET ai_billing_confirmed=false WHERE user_id=$1",[accounts.paid.id]);
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.paid.id})).entitlements.ai_generations_limit,5);
  await f.db.query("UPDATE subscriptions SET ai_billing_confirmed=true,is_trial=true WHERE user_id=$1",[accounts.paid.id]);
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.paid.id})).entitlements.ai_generations_limit,5);
});

test('an audited manual subscription grants 100 once and disabling it restores the trial allowance',async t=>{
  const f=await seedOdinAccounts(await createOdinDatabase());t.after(()=>f.close());
  const service=createOdinSubscriptionManagement(f.pool);
  const input={user_id:accounts.trial.id,actor:accounts.admin.email,action:'subscription_issue',reason:'Isolated admin fixture',
    expires_at:new Date(Date.now()+10*86400000).toISOString(),plan_name:'Odin manual access',request_id:randomUUID()};
  await service.change(input);await service.change(input);
  const rows=(await f.db.query('SELECT * FROM subscriptions WHERE user_id=$1',[accounts.trial.id])).rows;
  assert.equal(rows.length,1);
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.trial.id})).entitlements.ai_generations_limit,100);
  await service.change({...input,action:'subscription_disable',subscription_id:Number(rows[0].id)});
  assert.equal((await f.auth.profile({id:'device',user_id:accounts.trial.id})).entitlements.ai_generations_limit,5);
  assert.equal((await f.db.query('SELECT count(*)::int AS count FROM odin_motionflow_audit WHERE user_id=$1',[accounts.trial.id])).rows[0].count,2);
});

test('verified paid-through dates control access and the profile expiry despite missing or rounded legacy dates',async t=>{
  const f=await seedOdinAccounts(await createOdinDatabase());t.after(()=>f.close());
  const until=new Date(Date.now()+86400000).toISOString();
  for(const legacy of ['',new Date(Date.now()-1000).toISOString()]) {
    await f.db.query('UPDATE subscriptions SET next_charge_date=$1,ai_paid_until=$2 WHERE user_id=$3',
      [legacy,until,accounts.paid.id]);
    const profile=await f.auth.profile({id:'device',user_id:accounts.paid.id});
    assert.equal(profile.subscription.active,true);assert.equal(profile.entitlements.ai_generations_limit,100);
    assert.equal(profile.subscription.renews_at,until);
  }
});
