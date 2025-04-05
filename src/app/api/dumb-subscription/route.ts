import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";

export async function POST(request: Request) {
	const headersList = await headers();
	const securityCode = headersList.get("AtomX-Secure-Check");

	const { email, password } = await request.json();

	if (!email || !password || securityCode !== process.env.ATOMX_SECRET) {
		return new Response(JSON.stringify({ message: "Email or password is incorrect" }), {
			status: 400
		});
	}

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

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
		return new Response(JSON.stringify({ message: "User authenticated successfully" }), {
			status: 200
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ message: "Authentication failed" }), {
			status: 500
		});
	}
}
