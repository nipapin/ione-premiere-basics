export interface AffiliateLink {
	code: string;
	label: string;
}

export interface AffiliateStats {
	affiliate: string;
	label?: string;
	subscriptions: number;
	licenses: number;
	trials: number;
	statuses: Record<string, number>;
	oneTimeOrders: number;
}
