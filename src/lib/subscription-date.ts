/** PayPro stores local dates with '+' separators; ISO timestamps keep their offset. */
export function parseSubscriptionDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  let date: Date;
  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}\+/.test(value.trim())) {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\+(\d{1,2}):(\d{2})\+(AM|PM)$/i.exec(value.trim());
    if (!match) return null;
    const [, monthText, dayText, yearText, hourText, minuteText, period] = match;
    const month = Number(monthText), day = Number(dayText), year = Number(yearText);
    const hour = Number(hourText), minute = Number(minuteText);
    if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 1 || hour > 12 || minute > 59) return null;
    date = new Date(year, month - 1, day, hour % 12 + (period.toUpperCase() === "PM" ? 12 : 0), minute);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  } else {
    date = new Date(value);
  }
  return Number.isFinite(date.getTime()) ? date : null;
}

type Subscription = {
  next_charge_date: string | Date | null;
  management_disabled?: boolean;
  management_source?: string;
  product_id?: string | number | null;
  status?: string;
};

/** Identify the one-time PayPro product; a missing expiry alone is not Lifetime. */
export function isLifetimeSubscription(subscription: { product_id?: string | number | null; management_source?: string }): boolean {
  return subscription.management_source !== "manual" && String(subscription.product_id) === "113887";
}

export function isSubscriptionActive(subscription: Subscription, now = Date.now()): boolean {
  if (subscription.management_disabled) return false;
  if (isLifetimeSubscription(subscription)) return subscription.status?.trim().toLowerCase() === "active";
  return (parseSubscriptionDate(subscription.next_charge_date)?.getTime() ?? 0) > now;
}
