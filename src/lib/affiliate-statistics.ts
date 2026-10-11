import "server-only";
import { query } from "@/app/database/postgre";
import type { AffiliateStats } from "@/types/affiliates";

export async function getAffiliateStatistics(links: string[]): Promise<AffiliateStats[]> {
	if (!links.length) return [];
	const [subscriptions, payments] = await Promise.all([
		query(`SELECT affilate, COALESCE(status, 'unknown') AS status,
			COALESCE(is_trial, false) AS is_trial, COUNT(*)::int AS count,
			SUM(GREATEST(COALESCE(quantity, 0), 0))::int AS licenses
			FROM subscriptions WHERE affilate = ANY($1::text[])
			GROUP BY affilate, status, is_trial`, [links]),
		query(`SELECT affilate, COUNT(*)::int AS count FROM payments
			WHERE affilate = ANY($1::text[]) AND status = 'Processed' GROUP BY affilate`, [links]),
	]);
	const stats = new Map<string, AffiliateStats>(links.map(affiliate => [affiliate, {
		affiliate, subscriptions: 0, licenses: 0, trials: 0, statuses: {}, oneTimeOrders: 0,
	}]));
	for (const row of subscriptions) {
		const item = stats.get(row.affilate);
		if (!item) continue;
		item.subscriptions += Number(row.count);
		item.licenses += Number(row.licenses);
		if (row.is_trial) item.trials += Number(row.count);
		Object.defineProperty(item.statuses, row.status, {
			value: (Object.hasOwn(item.statuses, row.status) ? item.statuses[row.status] : 0) + Number(row.count),
			enumerable: true, configurable: true, writable: true,
		});
	}
	for (const row of payments) {
		const item = stats.get(row.affilate);
		if (item) item.oneTimeOrders += Number(row.count);
	}
	return [...stats.values()];
}
