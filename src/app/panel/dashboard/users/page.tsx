import { getDashboardData } from "@/actions/admin";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
	const data = await getDashboardData();

	if (!data) {
		redirect("/panel/login");
	}

	const { users, subscriptions } = data;

	return <UsersTable users={users} subscriptions={subscriptions} />;
}
