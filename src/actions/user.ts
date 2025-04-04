"use server";
import { validateCsrfToken } from "@/lib/csrf";
import { sendEmail } from "@/lib/email";
import { createSession, deleteAllUserSessions } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { User } from "@/types";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

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

	if (!data[0]) {
		return false;
	}

	await createSession(data[0].user_id);

	return true;
};

export const checkPassword = async (password: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const user_id = (await cookieStore).get("odin-pro-session")?.value;

	const { data, error } = await supabase.from("users").select("password").eq("user_id", user_id).single();

	if (error) {
		console.error("Supabase error:", error);
		return false;
	}

	const encryptedPassword = data?.password;
	return bcrypt.compareSync(password, encryptedPassword);
};

export const updatePassword = async (password: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const user_id = (await cookieStore).get("odin-pro-session")?.value;

	const encryptedPassword = await bcrypt.hash(password, 10);

	const { error } = await supabase.from("users").update({ password: encryptedPassword }).eq("user_id", user_id);

	if (error) {
		console.error("Supabase error:", error);
		return false;
	}

	return true;
};

export const updateName = async (name: string, lastname: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const user_id = (await cookieStore).get("odin-pro-session")?.value;

	const { error } = await supabase.from("users").update({ name, lastname }).eq("user_id", user_id);

	if (error) {
		console.error("Supabase error:", error);
		return false;
	}

	return true;
};

export const sendUpdateEmail = async (previousEmail: string, email: string): Promise<boolean> => {
	if (!Boolean(email)) return false;

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const user_id = (await cookieStore).get("odin-pro-session")?.value;
	const emailIsBusy = await isExist(email);

	if (emailIsBusy) {
		return false;
	}

	// const { error } = await supabase.from("users").update({ email }).eq("user_id", user_id);

	// if (error) {
	// 	console.error("Supabase error:", error);
	// 	return false;
	// }

	const confirmationToken = crypto.randomUUID();
	const { error } = await supabase.from("users").update({ confirmtoken: confirmationToken }).eq("user_id", user_id);

	if (error) {
		console.error("Supabase error:", error);
		return false;
	}

	await sendEmail(
		previousEmail,
		"Your email has been changed",
		`<h1>Your email has been changed</h1>
		<p>New email: ${email}</p>
		<p>If you did not change your email address, please <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">contact us immediately</a>.</p>
		<p>Please confirm your email address by clicking the link below:</p>
		<a href="${process.env.NEXT_PUBLIC_APP_URL}/change-email?token=${confirmationToken}&email=${Buffer.from(email).toString("base64")}">
			Confirm Email
		</a>
		<p>Best regards, <b>Odin Pro Team</b></p>
	`
	);
	// await sendEmail(
	// 	email,
	// 	"Welcome to Odin Pro",
	// 	`<h1>Welcome to Odin Pro</h1>
	// 	<p>Your E-mail has been changed.</p>
	// 	<p>Please confirm your email address by clicking the link below:</p>
	// 	<a href="${process.env.NEXT_PUBLIC_APP_URL}/change-email?token=${confirmationToken}&email=${Buffer.from(email).toString("base64")}">
	// 		Confirm Email
	// 	</a>
	// 	<p>Best regards, <b>Odin Pro Team</b></p>
	// `
	// );
	return true;
};

export const confirmUpdateEmail = async (token: string): Promise<boolean> => {
	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { data, error } = await supabase
		.from("users")
		.select("user_id, email, name, lastname, confirmtoken, emailconfirmed")
		.eq("confirmtoken", token)
		.single();

	if (error) {
		console.error("Supabase error:", error);
		return false;
	}

	if (!data) {
		return false;
	}

	return true;
};
