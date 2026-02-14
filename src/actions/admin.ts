"use server";

import { query } from "@/app/database/postgre";
import { get } from "@/actions/user";
import { deleteSessionsForUser } from "@/lib/session";
import { cookies } from "next/headers";

export interface DashboardUser {
	user_id: string;
	email: string;
	name: string;
	lastname: string;
	is_admin: boolean;
	paypro_customer_id: string | null;
	subscription_status?: string | null;
	subscription_id?: number | null;
}

export interface DashboardSubscription {
	id: number;
	order_id: string;
	subscription_id: string;
	status: string;
	invoice: string | null;
	is_trial: boolean;
	trial_period_till: string | null;
	next_charge_date: string | null;
	quantity: number;
	user_id: string;
	customer_id: string | null;
	order_item_name: string | null;
	seats: string[] | null;
	product_id: string | null;
	affilate: string | null;
}

export interface DashboardStats {
	totalUsers: number;
	totalSubscriptions: number;
	activeSubscriptions: number;
	trialSubscriptions: number;
	cancelledSubscriptions: number;
}

async function ensureAdmin() {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;
	if (!user_id) return null;
	const user = await get(user_id);
	if (!user?.is_admin) return null;
	return user_id;
}

export async function getDashboardData(): Promise<{
	users: DashboardUser[];
	subscriptions: DashboardSubscription[];
	stats: DashboardStats;
} | null> {
	if (!(await ensureAdmin())) return null;

	const [users, subscriptions] = await Promise.all([
		query(
			`SELECT 
				u.user_id, 
				u.email, 
				u.name, 
				u.lastname, 
				u.is_admin, 
				u.paypro_customer_id,
				s.status as subscription_status,
				s.id as subscription_id
			FROM users u
			LEFT JOIN subscriptions s ON u.user_id = s.user_id
			ORDER BY u.email ASC`
		) as Promise<DashboardUser[]>,
		query(
			`SELECT id, order_id, subscription_id, status, invoice, is_trial, trial_period_till, next_charge_date, quantity, user_id, customer_id, order_item_name, seats, product_id, affilate FROM subscriptions ORDER BY id DESC`
		) as Promise<DashboardSubscription[]>,
	]);

	const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;
	const trialSubscriptions = subscriptions.filter((s) => s.is_trial).length;
	const cancelledSubscriptions = subscriptions.filter(
		(s) => s.status === "cancelled" || s.status === "failed"
	).length;

	const stats: DashboardStats = {
		totalUsers: users.length,
		totalSubscriptions: subscriptions.length,
		activeSubscriptions,
		trialSubscriptions,
		cancelledSubscriptions,
	};

	return { users, subscriptions, stats };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
	if (!(await ensureAdmin())) return { success: false, error: "Unauthorized" };
	try {
		await query("DELETE FROM payments WHERE user_id = $1", [userId]);
		await query("DELETE FROM subscriptions WHERE user_id = $1", [userId]);
		await deleteSessionsForUser(userId);
		await query("DELETE FROM users WHERE user_id = $1", [userId]);
		return { success: true };
	} catch (err) {
		console.error("Delete user error:", err);
		return { success: false, error: String(err) };
	}
}

export async function deleteSubscription(subId: number): Promise<{ success: boolean; error?: string }> {
	if (!(await ensureAdmin())) return { success: false, error: "Unauthorized" };
	try {
		await query("DELETE FROM subscriptions WHERE id = $1", [subId]);
		return { success: true };
	} catch (err) {
		console.error("Delete subscription error:", err);
		return { success: false, error: String(err) };
	}
}

export async function updateUser(
	userId: string,
	data: { email?: string; name?: string; lastname?: string; is_admin?: boolean }
): Promise<{ success: boolean; error?: string }> {
	if (!(await ensureAdmin())) return { success: false, error: "Unauthorized" };
	try {
		const updates: string[] = [];
		const values: (string | boolean)[] = [];
		let i = 1;
		if (data.email !== undefined) {
			updates.push(`email = $${i++}`);
			values.push(data.email.toLowerCase().trim());
		}
		if (data.name !== undefined) {
			updates.push(`name = $${i++}`);
			values.push(data.name);
		}
		if (data.lastname !== undefined) {
			updates.push(`lastname = $${i++}`);
			values.push(data.lastname);
		}
		if (data.is_admin !== undefined) {
			updates.push(`is_admin = $${i++}`);
			values.push(data.is_admin);
		}
		if (updates.length === 0) return { success: true };
		values.push(userId);
		await query(`UPDATE users SET ${updates.join(", ")} WHERE user_id = $${i}`, values);
		return { success: true };
	} catch (err) {
		console.error("Update user error:", err);
		return { success: false, error: String(err) };
	}
}

export async function updateSubscription(
	subId: number,
	data: {
		status?: string;
		order_item_name?: string;
		quantity?: number;
		next_charge_date?: string | null;
	}
): Promise<{ success: boolean; error?: string }> {
	if (!(await ensureAdmin())) return { success: false, error: "Unauthorized" };
	try {
		const updates: string[] = [];
		const values: (string | number | null)[] = [];
		let i = 1;
		if (data.status !== undefined) {
			updates.push(`status = $${i++}`);
			values.push(data.status);
		}
		if (data.order_item_name !== undefined) {
			updates.push(`order_item_name = $${i++}`);
			values.push(data.order_item_name);
		}
		if (data.quantity !== undefined) {
			updates.push(`quantity = $${i++}`);
			values.push(data.quantity);
		}
		if (data.next_charge_date !== undefined) {
			updates.push(`next_charge_date = $${i++}`);
			values.push(data.next_charge_date);
		}
		if (updates.length === 0) return { success: true };
		values.push(subId);
		await query(`UPDATE subscriptions SET ${updates.join(", ")} WHERE id = $${i}`, values);
		return { success: true };
	} catch (err) {
		console.error("Update subscription error:", err);
		return { success: false, error: String(err) };
	}
}
