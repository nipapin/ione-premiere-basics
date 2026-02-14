import { get } from "@/actions/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PanelPage() {
    const cookieStore = await cookies();
    const user_id = cookieStore.get("odin-pro-session")?.value;
    if (!user_id) {
        redirect("/panel/login");
    }
    const user = await get(user_id);
    if (!user || !user.is_admin) {
        redirect("/panel/login");
    }
    return redirect("/panel/dashboard");
}