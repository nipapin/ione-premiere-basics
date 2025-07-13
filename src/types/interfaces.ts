export interface ISubscriptionDetails {
	status: string;
	order_item_name: string;
	next_charge_date: string;
	quantity: number;
	next_quantity: number;
	subscription_id: string;
	seats: string[];
	type: "primary" | "invite" | "none";
	email: string;
}

export interface PrimaryDetailsProps {
	subscription?: ISubscriptionDetails;
	user: User;
	pending: boolean;
}

export interface InviteDetailsProps {
	subscription?: ISubscriptionDetails;
	user: User;
	pending: boolean;
}

export interface User {
	user_id: string;
	email: string;
	name: string;
	lastname: string;
	confirmtoken?: string;
	paypro_customer_id?: string;
}

export interface Session {
	user_id: string;
	session_id: string;
	ip_address: string;
	user_agent: string;
	created_at: string;
	expires_at: string;
}

export interface Product {
	logoUrl: string;
	name: string;
	displayPrice: number;
	quantity: number;
	next_quantity: number;
	daysBeforeCharge: number;
}
