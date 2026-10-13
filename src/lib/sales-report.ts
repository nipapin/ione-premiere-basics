import "server-only";
import { query } from "@/app/database/postgre";
import { isSubscriptionActive } from "@/lib/subscription-date";
import { paidStatuses } from "../../db/paypro-sales.mjs";

export function salesPeriod(params: URLSearchParams, now = new Date()) {
	const period = params.get("period") || "month";
	if (period === "all") return { period, from: null, to: null };
	if (period === "month" || period === "last-month") {
		const offset = period === "last-month" ? -1 : 0;
		return { period, from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)).toISOString(), to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 1)).toISOString() };
	}
	if (period !== "custom") throw new Error("INVALID_PERIOD");
	const from = params.get("from"), to = params.get("to");
	const valid = (value: string | null) => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(value).getTime()) && new Date(value).toISOString().slice(0, 10) === value;
	if (!valid(from) || !valid(to) || from! > to!) throw new Error("INVALID_PERIOD");
	return { period, from: `${from}T00:00:00.000Z`, to: new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86400000).toISOString() };
}

type SalesRow = {
	order_id: string; order_item_id: string; buyer_key: string; buyer_label: string; plan: string;
	referral: string | null; paid_at: Date | string; status: string; currency: string;
	gross_amount: string; refunded_amount: string; balance_currency: string | null; fee_amount: string | null; net_amount: string | null;
	balance_gross_amount: string | null; balance_refunded_amount: string | null;
};

export async function getSalesReport(codes: string[] | null, period: ReturnType<typeof salesPeriod>, page = 1) {
	const [rows, subscriptions, visits]: [SalesRow[], any[], {code: string; count: number}[]] = await Promise.all([
		query(`SELECT order_id,order_item_id,buyer_key,buyer_label,plan,referral,paid_at,status,currency,
			gross_amount,refunded_amount,balance_currency,fee_amount,net_amount,balance_gross_amount,balance_refunded_amount FROM odin_sales
			WHERE status=ANY($4::text[]) AND gross_amount>0
			AND ($1::text[] IS NULL OR referral=ANY($1::text[]))
			AND ($2::timestamptz IS NULL OR paid_at >= $2) AND ($3::timestamptz IS NULL OR paid_at < $3)
			ORDER BY paid_at DESC,order_id DESC,order_item_id DESC`, [codes, period.from, period.to, paidStatuses]),
		query("SELECT * FROM subscriptions WHERE ($1::text[] IS NULL OR affilate=ANY($1::text[]))", [codes]),
		query(`SELECT code,count(*)::int AS count FROM odin_referral_visits
			WHERE ($1::text[] IS NULL OR code=ANY($1::text[]))
			AND ($2::timestamptz IS NULL OR visited_at >= $2) AND ($3::timestamptz IS NULL OR visited_at < $3)
			GROUP BY code`, [codes, period.from, period.to]),
	]);
	return {
		period, summary: summarize(rows, subscriptions, visits.reduce((sum, row) => sum + row.count, 0)),
		linkSummaries: Object.fromEntries([...new Set([...rows.map(row => row.referral), ...subscriptions.map(row => row.affilate), ...visits.map(row => row.code)])].filter(Boolean).map(code => [code, summarize(rows.filter(row => row.referral === code), subscriptions.filter(row => row.affilate === code), visits.find(row => row.code === code)?.count || 0)])),
		page, totalRows: rows.length, pageSize: 25,
		payments: rows.slice((page - 1) * 25, page * 25).map(row => ({
			id: `${row.order_id}-${row.order_item_id}`, orderId: row.order_id, buyer: row.buyer_label,
			plan: row.plan, source: row.referral, date: new Date(row.paid_at).toISOString(), status: row.status,
			currency: row.currency, gross: Number(row.gross_amount), refunds: Number(row.refunded_amount), revenue: (Math.round(Number(row.gross_amount) * 100) - Math.round(Number(row.refunded_amount) * 100)) / 100,
			balanceCurrency: row.balance_currency, fee: row.fee_amount === null ? null : Number(row.fee_amount), net: row.net_amount === null ? null : Number(row.net_amount),
		})),
	};
}
function summarize(rows: SalesRow[], subscriptions: any[], visits: number) {
	const currencies = new Map<string, { currency: string; gross: number; refunds: number; revenue: number }>();
	const balances = new Map<string, { currency: string; fees: number; net: number; revenue: number; missing: number }>();
	const orders = new Set<string>(), buyers = new Set<string>();
	for (const row of rows) {
		orders.add(row.order_id);
		if (Number(row.gross_amount) > Number(row.refunded_amount)) buyers.add(row.buyer_key);
		const currency = currencies.get(row.currency) || { currency: row.currency, gross: 0, refunds: 0, revenue: 0 };
		currency.gross += Math.round(Number(row.gross_amount) * 100);
		currency.refunds += Math.round(Number(row.refunded_amount) * 100);
		currency.revenue = currency.gross - currency.refunds;
		currencies.set(row.currency, currency);
		if (row.balance_currency) {
			const balance = balances.get(row.balance_currency) || { currency: row.balance_currency, fees: 0, net: 0, revenue: 0, missing: 0 };
			if (row.fee_amount !== null) balance.fees += Math.round(Number(row.fee_amount) * 100);
			if (row.net_amount !== null) balance.net += Math.round(Number(row.net_amount) * 100);
			if (row.balance_gross_amount !== null && row.balance_refunded_amount !== null) balance.revenue += Math.round(Number(row.balance_gross_amount) * 100) - Math.round(Number(row.balance_refunded_amount) * 100);
			if (row.fee_amount === null || row.net_amount === null || row.balance_gross_amount === null || row.balance_refunded_amount === null) balance.missing++;
			balances.set(row.balance_currency, balance);
		}
	}
	const active = subscriptions.filter(sub => sub.status === "active" && !sub.is_trial && sub.management_source !== "manual" && isSubscriptionActive(sub));
	return {
		visits,
			transactions: orders.size, buyers: buyers.size, activeSubscriptions: active.length,
			activeLicenses: active.reduce((sum, sub) => sum + (Number(sub.quantity) || 0), 0),
			currencies: [...currencies.values()].map(row => ({ ...row, gross: row.gross / 100, refunds: row.refunds / 100, revenue: row.revenue / 100 })),
			balances: [...balances.values()].map(row => ({ ...row, fees: row.fees / 100, net: row.net / 100, revenue: row.revenue / 100 })),
	};
}
