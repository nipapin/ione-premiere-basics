import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";

export async function POST(request: Request) {
	const headersList = await headers();
	const securityCode = headersList.get("AtomX-Secure-Check");

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const { email, password, type } = await request.json();
	//securityCode !== process.env.ATOMX_SECRET
	if (type === "login") {
		if (!email || !password) {
			return new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
				status: 400
			});
		}
		const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

		if (error || !data) {
			return new Response(JSON.stringify({ message: "User with this email not found" }), {
				status: 404
			});
		}

		const isPasswordValid = bcrypt.compareSync(password, data.password);

		if (!isPasswordValid) {
			return new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
				status: 401
			});
		}

		try {
			return new Response(
				JSON.stringify({
					message: "User authenticated successfully",
					id: data.user_id,
					status: data.subscription_status,
					max_devices: data.max_devices
				}),
				{
					status: 200
				}
			);
		} catch (error) {
			console.error(error);
			return new Response(JSON.stringify({ message: "Authentication failed" }), {
				status: 500
			});
		}
	}

	if (type === "recheck") {
		if (!email || securityCode !== process.env.ATOMX_SECRET) {
			return new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
				status: 400
			});
		}
		const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

		if (error || !data) {
			return new Response(JSON.stringify({ message: "User with this email not found" }), {
				status: 404
			});
		}

		if (data.subscription_status === "active") {
			return new Response(JSON.stringify({ status: "active", max_devices: 2, message: "User has subscription" }), {
				status: 200
			});
		}

		return new Response(JSON.stringify({ status: null, max_devices: 0, message: "User does not have subscription" }), {
			status: 200
		});
	}

	return new Response(JSON.stringify({ message: "Invalid request" }), {
		status: 500
	});
}
