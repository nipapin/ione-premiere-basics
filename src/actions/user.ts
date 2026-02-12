"use server";
import { query } from "@/app/database/postgre";
import { validateCsrfToken } from "@/lib/csrf";
import { sendEmail } from "@/lib/email";
import { createSession, deleteAllUserSessions } from "@/lib/session";
import { User } from "@/types/interfaces";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export const create = async (
	name: string,
	email: string,
	_password: string,
	csrfToken: string
): Promise<User | null> => {
	// Validate CSRF token
	if (!validateCsrfToken(csrfToken)) {
		throw new Error("Invalid CSRF token");
	}

	const [firstName, lastName] = name.split(" ");

	const hashedPassword = await bcrypt.hash(_password, 10);
	const confirmationToken = crypto.randomUUID();

	const data = await query(
		`INSERT INTO users (email, password, name, lastname, confirmtoken) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, name, lastname, confirmtoken`,
		[email.toLowerCase().trim(), hashedPassword, firstName, lastName || "", confirmationToken]
	).then((res) => res[0]);

	// Create a new session for the user
	await createSession(data.user_id);

	return data;
};

export const login = async (email: string, password: string, csrfToken: string): Promise<User | null> => {
	// Validate CSRF token
	if (!validateCsrfToken(csrfToken)) {
		throw new Error("Invalid CSRF token");
	}

	const data = await query(`SELECT user_id, email, password, name, lastname, is_admin FROM users WHERE email = $1`, [
		email.toLowerCase().trim(),
	]).then((res) => res[0]);

	if (!data) {
		return null;
	}

	const isValid = await bcrypt.compare(password, data.password);

	if (!isValid) {
		return null;
	}

	const userData = {
		user_id: data.user_id,
		email: data.email,
		name: data.name,
		lastname: data.lastname,
		is_admin: data.is_admin
	};

	// Create a new session for the user
	await createSession(userData.user_id);

	return userData;
};

export const get = async (user_id: string): Promise<User | null> => {
	const data = await query(`SELECT user_id, email, name, lastname, paypro_customer_id, is_admin FROM users WHERE user_id = $1`, [
		user_id,
	]).then((res) => res[0]);

	if (!data) {
		return null;
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
	const data = await query(`SELECT user_id FROM users WHERE email = $1`, [email.toLowerCase().trim()]).then(
		(res) => res[0]
	);
	return !!data;
};

export const sendConfirmationEmail = async (email: string, confirmationToken: string): Promise<boolean> => {
	const user = await query(`SELECT user_id, email, name FROM users WHERE email = $1`, [
		email.toLowerCase().trim(),
	]).then((res) => res[0]);
	if (!user) {
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
	const data = await query(
		`UPDATE users SET confirmtoken = null, emailconfirmed = true WHERE confirmtoken = $1 OR emailconfirmed = true RETURNING user_id, email, name, lastname, confirmtoken, emailconfirmed`,
		[token]
	).then((res) => res[0]);

	if (!data) {
		return false;
	}

	await createSession(data.user_id);

	return true;
};

export const checkPassword = async (password: string): Promise<boolean> => {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	const data = await query(`SELECT password FROM users WHERE user_id = $1`, [user_id]).then((res) => res[0]);

	if (!data) {
		return false;
	}

	const encryptedPassword = data?.password;
	return bcrypt.compareSync(password, encryptedPassword);
};

export const updatePassword = async (password: string, email?: string): Promise<boolean> => {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	const encryptedPassword = await bcrypt.hash(password, 10);
	if (email) {
		await query(`UPDATE users SET password = $1 WHERE email = $2`, [encryptedPassword, email]);

		return true;
	} else {
		await query(`UPDATE users SET password = $1 WHERE user_id = $2`, [encryptedPassword, user_id]);

		return true;
	}
};

export const updateName = async (name: string, lastname: string): Promise<boolean> => {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	await query(`UPDATE users SET name = $1, lastname = $2 WHERE user_id = $3`, [name, lastname, user_id]);

	return true;
};

export const sendUpdateEmail = async (previousEmail: string, email: string): Promise<boolean> => {
	if (!Boolean(email)) return false;

	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;
	console.log(user_id);

	const emailIsBusy = await isExist(email);

	if (emailIsBusy) {
		return false;
	}

	const confirmationToken = Math.random().toString(36).substring(2, 6).toUpperCase();
	await query(`UPDATE users SET confirmtoken = $1 WHERE user_id = $2`, [confirmationToken, user_id]);

	return await sendEmail(
		previousEmail,
		"Your email has been changed",
		`<h1>Your email has been changed</h1>
		<p>New email: ${email}</p>
		<p>If you did not change your email address, please <a href="${process.env.NEXT_PUBLIC_APP_URL
		}/contact">contact us immediately</a>.</p>
		<p>Please confirm your email address by clicking the link below:</p>
		<a href="${process.env.NEXT_PUBLIC_APP_URL}/change-email?token=${confirmationToken}&email=${Buffer.from(email).toString(
			"base64"
		)}">
			Confirm Email
		</a>
		<p>Best regards, <b>Odin Pro Team</b></p>
	`
	);
};

export const confirmUpdateEmail = async (token: string): Promise<boolean> => {
	const data = await query(
		`SELECT user_id, email, name, lastname, confirmtoken, emailconfirmed FROM users WHERE confirmtoken = $1`,
		[token]
	).then((res) => res[0]);

	if (!data) {
		return false;
	}

	query(`UPDATE users SET confirmtoken = null, emailconfirmed = true WHERE confirmtoken = $1`, [token]);

	return true;
};

export const sendResetPasswordEmail = async (email: string): Promise<boolean> => {
	const confirmationToken = crypto.randomUUID();
	const data = await query(`UPDATE users SET confirmtoken = $1 WHERE email = $2 RETURNING name`, [
		confirmationToken,
		email,
	]).then((res) => res[0]);

	if (!data) {
		return false;
	}

	return await sendEmail(
		email,
		"OdinPro - Reset Password",
		`<h1>OdinPro - Reset Password</h1>
		<p>Hello ${data.name},</p>
		<p>If you did not change your password, please <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">contact us immediately</a>.</p>
		<p>Your confirmation code is: <b>${confirmationToken}</b></p>
		<p>Best regards, <b>Odin Pro Team</b></p>
	`
	);
};

export const confirmResetPassword = async (email: string, confirmationCode: string): Promise<boolean> => {
	const data = await query(`SELECT * FROM users WHERE confirmtoken = $1 AND email = $2`, [
		confirmationCode,
		email,
	]).then((res) => res[0]);

	if (!data) {
		return false;
	}

	query(`UPDATE users SET confirmtoken = null WHERE user_id = $1`, [data.user_id]);

	return true;
};
