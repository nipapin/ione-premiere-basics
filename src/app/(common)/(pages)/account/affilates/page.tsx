import { get } from "@/actions/user";
import AffiliateStatistics from "@/components/account/AffiliateStatistics";
import { getAccountAffiliateLinks } from "@/lib/affiliate-access";
import { validateSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AffiliatePage() {
	const session = await validateSession();
	if (!session) redirect("/login?next=%2Faccount%2Faffilates");
	const user = await get(session.user_id);
	if (!(await getAccountAffiliateLinks(user)).length) redirect("/account");
	return <AffiliateStatistics isAdmin={user?.is_admin === true} />;
}
