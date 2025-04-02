import { get } from "@/actions/user";
import AccountDetails from "@/components/account/AccountDetails";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Premiere Basics | Account",
	description: "Manage your account",
};

export default async function AccountPage() {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (!user_id) {
		redirect("/login");
	}

	const user = await get(user_id);

	if (!user) {
		redirect("/login");
	}

	return <AccountDetails />;
}
