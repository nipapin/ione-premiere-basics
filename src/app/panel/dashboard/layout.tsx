import Sidebar from "./Sidebar";
import { get } from "@/actions/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const user_id = cookieStore.get("odin-pro-session")?.value;

	if (!user_id) {
		redirect("/panel/login");
	}

	const currentUser = await get(user_id);
	
	if (!currentUser?.is_admin) {
		redirect("/panel/login");
	}

	const adminName = `${currentUser.name} ${currentUser.lastname}`.trim();

	return <Sidebar adminName={adminName}>{children}</Sidebar>;
}
