"use server";
import bcrypt from "bcrypt";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { User } from "@/types";
import { validateCsrfToken } from "@/lib/csrf";
import { createSession, deleteAllUserSessions, validateSession } from "@/lib/session";

export const create = async (name: string, email: string, _password: string, csrfToken: string): Promise<User | null> => {
	// Validate CSRF token
	if (!validateCsrfToken(csrfToken)) {
		throw new Error("Invalid CSRF token");
	}

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const [firstName, lastName] = name.split(" ");

	const hashedPassword = await bcrypt.hash(_password, 10);

	// Insert user and get the UUID
	const { data, error } = await supabase
		.from("users")
		.insert({
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			name: firstName,
			lastname: lastName || ""
		})
		.select("user_id, email, name, lastname")
		.single();

	if (error) {
		console.error("Supabase error:", error);
		throw error;
	}

	// Create a new session for the user
	await createSession(data.user_id);

	return data;
};

export const login = async (email: string, password: string, csrfToken: string): Promise<User | null> => {
	// Validate CSRF token
	if (!validateCsrfToken(csrfToken)) {
		throw new Error("Invalid CSRF token");
	}

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { data, error } = await supabase
		.from("users")
		.select("user_id, email, password, name, lastname")
		.eq("email", email.toLowerCase().trim())
		.single();

	if (!data) {
		return null;
	}

	const isValid = await bcrypt.compare(password, data.password);

	if (!isValid) {
		return null;
	}

	if (error) {
		console.error("Supabase error:", error);
		throw error;
	}

	const userData = {
		user_id: data.user_id,
		email: data.email,
		name: data.name,
		lastname: data.lastname
	};

	// Create a new session for the user
	await createSession(userData.user_id);

	return userData;
};

export const get = async (user_id: string): Promise<User | null> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	// Validate the session
	const session = await validateSession();
	if (!session || session.user_id !== user_id) {
		return null;
	}

	const { data, error } = await supabase.from("users").select("user_id, email, name, lastname").eq("user_id", user_id).single();

	if (!data) {
		return null;
	}

	if (error) {
		throw error;
	}

	return data;
};

export const logout = async (): Promise<boolean> => {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (user_id) {
		// Delete all sessions for the user
		await deleteAllUserSessions(user_id);
	}

	return true;
};

export const isExist = async (email: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { data, error } = await supabase.from("users").select("user_id").eq("email", email).single();

	if (error) {
		throw error;
	}

	return !!data;
};
