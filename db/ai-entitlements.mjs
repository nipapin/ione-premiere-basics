import { createHash } from 'node:crypto';
import { isLifetimeSubscription, parseSubscriptionDate } from './subscription-date.mjs';

export const ODIN_PAID_GENERATIONS = 100;
export const ODIN_TRIAL_GENERATIONS = 5;

/** Always calculate from the original UTC day, so Jan 31 → Feb 28 → Mar 31. */
export function addCalendarMonths(anchor, months) {
  const date = new Date(anchor);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1,
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function monthlyWindow(anchor, now = Date.now()) {
  const date = parseSubscriptionDate(anchor);
  if (!date || date.getTime() > now) return null;
  const current = new Date(now);
  let month = (current.getUTCFullYear() - date.getUTCFullYear()) * 12 + current.getUTCMonth() - date.getUTCMonth();
  if (addCalendarMonths(date, month).getTime() > now) month--;
  return { start: addCalendarMonths(date, month), end: addCalendarMonths(date, month + 1) };
}

/** Server-only allocation. Package access and AI access are separate permissions. */
export function resolveAiEntitlement({ registeredAt, subscription, active, override }, now = Date.now()) {
  const blocked = reason => ({ version: 2, plan: 'blocked', limit: 0, period_id: null,
    period_start: null, period_end: null, reason });
  if (override?.mode === 'deny') return blocked('ACCESS_BLOCKED');
  const paid = Boolean(active && !subscription?.is_trial && !subscription?.is_test);
  let window;
  let source = 'registration';
  if (!paid) {
    window = monthlyWindow(registeredAt, now);
  } else if (subscription) {
    source = String(subscription.subscription_id);
    const anchor = subscription.ai_billing_anchor;
    if (String(subscription.product_id) === '111867' && subscription.management_source !== 'manual') {
      // Monthly quota advances only after a confirmed charge, never just because time passed.
      const start = parseSubscriptionDate(subscription.ai_last_paid_at);
      const end = parseSubscriptionDate(subscription.ai_paid_until ?? subscription.next_charge_date);
      window = start && end && start.getTime() <= now && end.getTime() > now ? { start, end } : null;
    } else {
      window = monthlyWindow(anchor, now);
      if (window && !isLifetimeSubscription(subscription)) {
        const until = parseSubscriptionDate(subscription.ai_paid_until ?? subscription.next_charge_date);
        if (!until || until.getTime() <= now) window = null;
        else if (until < window.end) window.end = until;
      }
    }
  } else {
    source = 'manual-access';
    window = monthlyWindow(override?.updated_at, now);
    const until = parseSubscriptionDate(override?.expires_at);
    if (window && until && until < window.end) window.end = until;
  }
  if (!window) return blocked(paid ? 'BILLING_PERIOD_MISSING' : 'REGISTRATION_DATE_MISSING');
  const plan = paid ? 'paid' : 'trial';
  const start = window.start.toISOString();
  return { version: 2, plan, limit: paid ? ODIN_PAID_GENERATIONS : ODIN_TRIAL_GENERATIONS,
    period_id: createHash('sha256').update(`odin-ai-v2:${plan}:${source}:${start}`).digest('hex'),
    period_start: start, period_end: window.end.toISOString() };
}
