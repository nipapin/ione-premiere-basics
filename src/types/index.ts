export interface User {
	user_id: string;
	email: string;
	name: string;
	lastname: string;
}

export interface Session {
	user_id: string;
	session_id: string;
	ip_address: string;
	user_agent: string;
	created_at: string;
	expires_at: string;
}
