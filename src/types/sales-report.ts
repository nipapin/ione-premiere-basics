export interface SalesSummary {
	visits: number;
	transactions: number; buyers: number; activeSubscriptions: number; activeLicenses: number;
	currencies: { currency: string; gross: number; refunds: number; revenue: number }[];
	balances: { currency: string; fees: number; net: number; revenue: number; missing: number }[];
}
export interface SalesReport {
	period: { period: string; from: string | null; to: string | null };
	summary: SalesSummary;
	partner: { id: string; name: string } | null;
	partners: { id: string; name: string; links: { code: string; label: string }[]; summary: SalesSummary }[];
	links: { code: string; label: string }[];
	linkSummaries: Record<string, SalesSummary>;
	isAdmin: boolean; page: number; totalRows: number; pageSize: number;
	payments: { id: string; orderId: string; buyer: string; plan: string; source: string | null; date: string; status: string;
		currency: string; gross: number; refunds: number; revenue: number; balanceCurrency: string | null; fee: number | null; net: number | null }[];
}
