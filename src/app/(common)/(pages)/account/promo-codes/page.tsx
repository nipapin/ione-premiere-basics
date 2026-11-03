import { get } from "@/actions/user";
import { validateSession } from "@/lib/session";
import { redirect } from "next/navigation";
import PromoCodes from "@/components/account/PromoCodes";

export default async function PromoCodesPage() {
 const session=await validateSession();
 if(!session)redirect("/login?next=%2Faccount%2Fpromo-codes");
 const user=await get(session.user_id);
 if(user?.is_admin!==true)redirect("/account");
 return <PromoCodes/>;
}
