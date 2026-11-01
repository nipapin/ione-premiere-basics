import { get } from "@/actions/user";
import AffiliateStatistics from "@/components/account/AffiliateStatistics";
import SalesDashboard from "@/components/account/SalesDashboard";
import { query } from "@/app/database/postgre";
import { canViewAllAffiliateReports, getAccountAffiliateLinks } from "@/lib/affiliate-access";
import { validateSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AffiliatePage() {
	const session = await validateSession();
	if (!session) redirect("/login?next=%2Faccount%2Faffilates");
	const user = await get(session.user_id);
	if (await canViewAllAffiliateReports(user)) return <SalesDashboard />;
	const partner = (await query("SELECT id FROM odin_affiliate_partners WHERE user_id=$1 ORDER BY created_at LIMIT 1", [session.user_id]))[0];
	if (partner) redirect(`/account/affilates/${partner.id}`);
	if (!(await getAccountAffiliateLinks(user)).length) redirect("/account");
	return <AffiliateStatistics isAdmin={user?.is_admin === true} />;
}
