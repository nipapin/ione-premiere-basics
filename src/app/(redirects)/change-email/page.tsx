import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function page({ searchParams }: { searchParams: Promise<{ token: string; email: string }> }) {
	const { token, email } = await searchParams;

	const cookieStore = cookies();
	const supabase = await createClient(cookieStore);

	const response = await supabase
		.from("users")
		.update({ email: Buffer.from(email, "base64").toString("utf-8"), confirmtoken: null })
		.eq("confirmtoken", token)
		.single();

	if (response.error) {
		return <div>Error</div>;
	}

	redirect("/login");
}
