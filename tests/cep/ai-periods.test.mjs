import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyWindow, resolveAiEntitlement } from '../../db/ai-entitlements.mjs';

const now = Date.parse('2026-11-10T12:00:00Z');
const trial = anchor => resolveAiEntitlement({ registeredAt: anchor, active: false }, now);
test('every registered unpaid account gets five, anchored to its actual registration day', () => {
  assert.equal(trial('2024-05-01T00:00:00Z').limit, 5);
  assert.equal(trial('2024-05-01T00:00:00Z').period_end, '2026-12-01T00:00:00.000Z');
  assert.equal(trial('2024-10-23T08:00:00Z').period_end, '2026-11-23T08:00:00.000Z');
  assert.equal(trial('2024-10-23T08:00:00Z').plan, 'trial');
});
test('short months clamp to their last day and restore the original day afterwards', () => {
  const anchor = '2024-01-31T12:00:00Z';
  assert.equal(monthlyWindow(anchor,Date.parse('2024-02-29T12:00:00Z')).end.toISOString(),'2024-03-31T12:00:00.000Z');
  assert.equal(monthlyWindow(anchor,Date.parse('2025-02-28T12:00:00Z')).end.toISOString(),'2025-03-31T12:00:00.000Z');
  assert.equal(monthlyWindow(anchor,Date.parse('2026-04-30T12:00:00Z')).end.toISOString(),'2026-05-31T12:00:00.000Z');
});
test('monthly paid quota only changes after a confirmed charge, not the UTC calendar boundary', () => {
  const subscription = { subscription_id: 123, product_id: 111867, ai_billing_anchor: '2026-10-23T08:00:00Z',
    ai_last_paid_at: '2026-10-23T08:00:00Z', ai_paid_until: '2026-11-23T08:00:00Z' };
  const before = resolveAiEntitlement({ subscription, active: true },Date.parse('2026-10-31T12:00:00Z'));
  const after = resolveAiEntitlement({ subscription, active: true },now);
  assert.equal(after.limit,100); assert.equal(after.period_id,before.period_id);
  const renewal = resolveAiEntitlement({ subscription: { ...subscription, ai_last_paid_at:'2026-11-23T08:00:00Z',
    ai_paid_until:'2026-12-23T08:00:00Z' },active:true },Date.parse('2026-11-23T09:00:00Z'));
  assert.notEqual(renewal.period_id,after.period_id);
});
test('annual and Lifetime subscribers receive monthly periods anchored to purchase', () => {
  for (const product_id of [113886,113887]) {
    const subscription = { product_id,subscription_id:product_id,ai_billing_anchor:'2026-01-23T08:00:00Z',
      next_charge_date: product_id === 113886 ? '2027-01-23T08:00:00Z' : null };
    const ai=resolveAiEntitlement({ subscription,active:true },now);
    assert.equal(ai.limit,100); assert.equal(ai.period_end,'2026-11-23T08:00:00.000Z');
  }
});
test('missing/future registration dates and explicit admin blocks never invent credits', () => {
  assert.equal(trial(null).limit,0); assert.equal(trial('2099-01-01').limit,0);
  assert.equal(resolveAiEntitlement({registeredAt:'2024-01-01',active:false,override:{mode:'deny'}},now).limit,0);
});
