import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";

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
	const headersList = await headers();
	const securityCode = headersList.get("AtomX-Secure-Check");

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { email, password, type } = await request.json();

	if (type === "login") {
		if (!email || !password) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
					status: 400
				})
			);
		}

		const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

		if (error || !data) {
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
					message: "User authenticated successfully",
					id: data.user_id,
					status: data.subscription_status,
					max_devices: data.max_devices
				}),
				{ status: 200 }
			)
		);
	}

	if (type === "recheck") {
		if (!email || securityCode !== process.env.ATOMX_SECRET) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
					status: 400
				})
			);
		}

		const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

		if (error || !data) {
			return withCORSHeaders(
				new Response(JSON.stringify({ message: "User with this email not found" }), {
					status: 404
				})
			);
		}

		const response =
			data.subscription_status === "active"
				? { status: "active", max_devices: 2, message: "User has subscription" }
				: { status: null, max_devices: 0, message: "User does not have subscription" };

		return withCORSHeaders(new Response(JSON.stringify(response), { status: 200 }));
	}

	return withCORSHeaders(
		new Response(JSON.stringify({ message: "Invalid request" }), {
			status: 500
		})
	);
}
