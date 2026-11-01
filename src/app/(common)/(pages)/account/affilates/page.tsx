import { get } from "@/actions/user";
import SalesDashboard from "@/components/account/SalesDashboard";
import { canViewAllAffiliateReports } from "@/lib/affiliate-access";
import { validateSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AffiliatePage() {
	const session = await validateSession();
	if (!session) redirect("/login?next=%2Faccount%2Faffilates");
	const user = await get(session.user_id);
	if (!(await canViewAllAffiliateReports(user))) redirect("/account");
	return <SalesDashboard />;
}
