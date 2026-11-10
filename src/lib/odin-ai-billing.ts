import { parseSubscriptionDate } from "@/lib/subscription-date";

export type VerifiedBillingItem = {
  orderId: string; subscriptionId: string | null; productId: number; paidAt: string;
  status: string; grossAmount: number; refundedAmount: number;
};

type SubscriptionUpdate = {
  status: string; product_id: string; is_trial: boolean; next_charge_date: string; revoke_access: boolean;
};

const charges = new Set(["OrderCharged", "SubscriptionChargeSucceed", "TrialCharge"]);
const wonDisputes = new Set(["OrderChargebackIsWon", "OrderChargedBackWon"]);
const revokedStatuses = new Set(["refunded", "chargeback", "chargedback"]);

/** Called under the subscription/user lock. Provider replays cannot refill a quota. */
export function reconcileOdinBilling(
  previous: Record<string, any> | undefined,
  update: SubscriptionUpdate,
  event: string,
  item: VerifiedBillingItem | undefined,
) {
  // A separately approved Lifetime gift survives updates to its original paid plan.
  if (previous?.management_lifetime_granted) return null;
  const state = {
    anchor: previous?.ai_billing_anchor ?? null,
    paidAt: previous?.ai_last_paid_at ?? null,
    paidUntil: previous?.ai_paid_until ?? null,
    orderId: previous?.ai_paid_order_id ?? null,
    confirmed: previous?.ai_billing_confirmed ?? false,
    revokedAt: previous?.access_revoked_at ?? null,
  };
  const paidAt = item ? parseSubscriptionDate(item.paidAt) : null;
  const previousPaidAt = parseSubscriptionDate(state.paidAt);
  const older = paidAt && previousPaidAt && (paidAt < previousPaidAt ||
    (paidAt.getTime() === previousPaidAt.getTime() && BigInt(item!.orderId) < BigInt(state.orderId ?? 0)));
  if (older) return null;

  const revoke = item && (revokedStatuses.has(item.status) || update.revoke_access);
  if (revoke) {
    update.status = "cancelled";
    update.next_charge_date = "";
    update.revoke_access = true;
    return { ...state, revokedAt: state.revokedAt ?? new Date().toISOString() };
  }

  const grant = item && paidAt && !update.is_trial && item.grossAmount > item.refundedAmount &&
    ["processed", "partiallyrefunded", "chargebackwon", "orderchargebackiswon"].includes(item.status) &&
    (charges.has(event) || wonDisputes.has(event));
  if (grant) {
    // A replay of the original charge cannot undo its refund/chargeback.
    if (state.revokedAt && String(state.orderId) === item.orderId && !wonDisputes.has(event)) return null;
    if (state.confirmed && String(state.orderId) === item.orderId && !wonDisputes.has(event)) {
      update.status = previous!.status;
      update.next_charge_date = previous!.next_charge_date;
      return state;
    }
    const until = parseSubscriptionDate(update.next_charge_date) ?? parseSubscriptionDate(state.paidUntil);
    if (String(item.productId) !== "113887" && !until) throw new Error("Verified billing period is missing");
    update.status = "active";
    update.next_charge_date = until?.toISOString() ?? "";
    return {
      anchor: state.anchor && String(previous?.product_id) === String(item.productId) ? state.anchor : paidAt.toISOString(),
      paidAt: paidAt.toISOString(), paidUntil: until?.toISOString() ?? null,
      orderId: item.orderId, confirmed: true, revokedAt: null,
    };
  }

  if (previous) {
    // Notifications about cancellation or card changes cannot extend a paid period.
    update.product_id = String(previous.product_id);
    update.is_trial = previous.is_trial;
    update.next_charge_date = previous.next_charge_date;
    if (state.revokedAt) update.status = "cancelled";
  } else {
    update.status = "on-hold";
    update.next_charge_date = "";
  }
  return state;
}
