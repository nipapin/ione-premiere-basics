import type { EarningsScope } from "@/lib/partner-earnings";
export interface SalesSummary {
	missingSettlements: number;
	earnings: { currency: string; royalty: number; afterRoyalty: number; earnings: number }[];
	visits: number;
	transactions: number; buyers: number; activeSubscriptions: number; activeLicenses: number;
	currencies: { currency: string; gross: number; refunds: number; revenue: number }[];
	balances: { currency: string; fees: number; net: number; revenue: number; missing: number }[];
}
export interface SalesReport {
	period: { period: string; from: string | null; to: string | null };
	summary: SalesSummary;
	partner: { id: string; name: string; earningsScope: EarningsScope } | null;
	partners: { id: string; name: string; earningsScope: EarningsScope; links: { code: string; label: string }[]; summary: SalesSummary }[];
	links: { code: string; label: string }[];
	linkSummaries: Record<string, SalesSummary>;
	isAdmin: boolean; canCreateLinks: boolean; page: number; totalRows: number; pageSize: number;
	payments: { id: string; orderId: string; buyer: string; plan: string; source: string | null; date: string; status: string;
		settlement: { royalty: number; afterRoyalty: number; earnings: number } | null; currency: string; gross: number; refunds: number; revenue: number; balanceCurrency: string | null; fee: number | null; net: number | null }[];
}
