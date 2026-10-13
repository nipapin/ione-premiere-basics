import type { SalesSummary } from "@/types/sales-report";

/** PayPro reports actual earnings after fees and refunds in the balance currency. */
export function netSalesRevenue(summary: SalesSummary | undefined, currency: string) {
	return summary?.balances.find(row => row.currency === currency)?.net ?? 0;
}
