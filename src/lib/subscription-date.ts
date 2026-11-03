// The HTTP handlers and persistent Cinecom worker share the same access rules.
export { parseSubscriptionDate, isLifetimeSubscription, isSubscriptionActive } from "../../db/subscription-date.mjs";

import { isSubscriptionActive } from "../../db/subscription-date.mjs";

/** Keep paid/manual entitlements ahead of sandbox access, preserving recency within each group. */
export function selectActiveSubscription<T extends {is_test?: boolean; next_charge_date?: string | Date | null; management_disabled?: boolean; management_source?: string; product_id?: string | number | null; status?: string} = any>(subscriptions: T[]): T | undefined {
 return subscriptions.find(sub => !sub.is_test && isSubscriptionActive(sub))
  ?? subscriptions.find(sub => isSubscriptionActive(sub));
}
