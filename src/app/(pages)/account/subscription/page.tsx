import { get } from "@/actions/user";
import SubscriptionDetails from "@/components/account/SubscriptionDetails";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SubscriptionPage() {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (!user_id) {
		redirect("/");
	}

	const user = await get(user_id);

	if (!user) {
		redirect("/");
	}
	return <SubscriptionDetails />;
}
