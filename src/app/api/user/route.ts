import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { get } from "@/actions/user";
import { validateSession } from "@/lib/session";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const user_id = cookieStore.get("odin-pro-session")?.value;

		if (!user_id) {
			return NextResponse.json({ user: null });
		}

		// Validate the session without deleting it
		const session = await validateSession();
		if (!session) {
			// Just return null user without deleting the session
			return NextResponse.json({ user: null });
		}

		const userData = await get(user_id);

		if (!userData) {
			return NextResponse.json({ user: null });
		}

		return NextResponse.json({ user: userData });
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json({ user: null });
	}
}
