import { query } from "@/app/database/postgre";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

function withCORSHeaders(response: Response) {
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
	response.headers.set("Access-Control-Allow-Headers", "Content-Type, AtomX-Secure-Check");
	return response;
}

export async function OPTIONS() {
	// ⚙️ Ответ на preflight запрос
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, AtomX-Secure-Check",
			"Access-Control-Max-Age": "86400"
		}
	});
}

export async function POST(request: Request) {
	const cookieStore = cookies();

	const { email, password, type } = await request.json();

	if (type === "login") {
		/*
		return
		{
			uuid,
			email,
			subscription: {
				status: "active",
				price: [1, 2].filter * 10
			}
		}
		


		*/
		if (!email || !password) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
					status: 400
				})
			);
		}

		const data = await query(`SELECT * FROM users WHERE email = $1`, [email]).then((res) => res[0]);

		if (!data) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "User with this email not found" }), {
					status: 404
				})
			);
		}

		const isPasswordValid = bcrypt.compareSync(password, data.password);

		if (!isPasswordValid) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
					status: 401
				})
			);
		}

		return withCORSHeaders(
			new Response(
				JSON.stringify({
					subscription: {
						message: "User authenticated successfully",
						id: data.id,
						status: data.status,
						max_devices: data.max_devices
					},
					payload: {}
				}),
				{ status: 200 }
			)
		);
	}

	if (type === "recheck") {
		/*
		 */

		if (!email) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
					status: 400
				})
			);
		}
	}

	return withCORSHeaders(
		new Response(JSON.stringify({ message: "Invalid request" }), {
			status: 500
		})
	);
}
