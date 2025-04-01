"use server";
import bcrypt from "bcrypt";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { User } from "@/types";
import { validateCsrfToken } from "@/lib/csrf";
import { createSession, deleteAllUserSessions, validateSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export const create = async (name: string, email: string, _password: string, csrfToken: string): Promise<User | null> => {
	// Validate CSRF token
	if (!validateCsrfToken(csrfToken)) {
		throw new Error("Invalid CSRF token");
	}

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const [firstName, lastName] = name.split(" ");

	const hashedPassword = await bcrypt.hash(_password, 10);
	const confirmationToken = crypto.randomUUID();
	// Insert user and get the UUID
	const { data, error } = await supabase
		.from("users")
		.insert({
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			name: firstName,
			lastname: lastName || "",
			confirmtoken: confirmationToken
		})
		.select("user_id, email, name, lastname, confirmtoken");

	if (error) {
		console.error("Supabase error:", error);
		throw error;
	}

	// Create a new session for the user
	await createSession(data[0].user_id);

	return data[0];
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
	// const session = await validateSession();
	// if (!session || session.user_id !== user_id) {
	// 	return null;
	// }

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
		// Delete all sessions and cookies for the user
		await deleteAllUserSessions(user_id);
	}

	return true;
};

export const isExist = async (email: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { data, error } = await supabase.from("users").select("user_id").eq("email", email).maybeSingle();

	if (error) {
		throw error;
	}

	return !!data;
};

export const sendConfirmationEmail = async (email: string, confirmationToken: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { data: user, error } = await supabase.from("users").select("user_id, email, name").eq("email", email.toLowerCase().trim()).single();

	if (error || !user) {
		return false;
	}

	const emailSent = await sendEmail(
		user.email,
		"Confirm your email",
		`
			<h1>Welcome to our platform!</h1>
			<p>Hello ${user.name},</p>
			<p>Please click the link below to confirm your email address:</p>
			<a href="${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${confirmationToken}">
				Confirm Email
			</a>
		`
	);

	return emailSent;
};

export const confirmAccount = async (token: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { data, error } = await supabase
		.from("users")
		.update({ confirmtoken: null, emailconfirmed: true })
		.or(`confirmtoken.eq.${token},emailconfirmed.eq.true`)
		.select("user_id, email, name, lastname, confirmtoken, emailconfirmed");

	if (error) {
		throw error;
	}

	console.log(data);

	if (!data[0]) {
		return false;
	}

	await createSession(data[0].user_id);

	return true;
};
