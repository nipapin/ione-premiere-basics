import { canViewAllAffiliateReports } from "@/lib/affiliate-access";
import { query } from "@/app/database/postgre";
import { get } from "@/actions/user";
import SalesDashboard from "@/components/account/SalesDashboard";
import { validateSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export default async function PartnerSalesPage({ params }: { params: Promise<{ partnerId: string }> }) {
	const session = await validateSession();
	if (!session) redirect("/login");
	const user = await get(session.user_id);
	if (!(await canViewAllAffiliateReports(user))) notFound();
	const { partnerId } = await params;
	if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(partnerId)) notFound();
	const partner = (await query("SELECT id FROM odin_affiliate_partners WHERE id=$1", [partnerId]))[0];
	if (!partner) notFound();
	return <SalesDashboard partnerId={partnerId} />;
}
