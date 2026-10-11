import { get } from "@/actions/user";
import AffiliateStatistics from "@/components/account/AffiliateStatistics";
import { getAffiliateLinks } from "@/lib/affiliate-access";
import { validateSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AffiliatePage() {
	const session = await validateSession();
	if (!session) redirect("/login?next=%2Faccount%2Faffilates");
	const user = await get(session.user_id);
	if (!getAffiliateLinks(user).length) redirect("/account");
	return <AffiliateStatistics />;
}
