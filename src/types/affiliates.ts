export interface AffiliateStats {
	affiliate: string;
	subscriptions: number;
	licenses: number;
	trials: number;
	statuses: Record<string, number>;
	oneTimeOrders: number;
}
