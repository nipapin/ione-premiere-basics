import { cookies } from "next/headers";
import RedirectLoader from "./components/RedirectLoader";

interface ChargePaymentPageProps {
	searchParams: Promise<{ after: string }>;
}

export default async function ChargePaymentPage({ searchParams }: ChargePaymentPageProps) {
	const { after } = await searchParams;
	const affiliate = (await cookies()).get("odin-pro-affiliate")?.value || "";
	const productID = Buffer.from(after, "base64").toString("utf-8");

	return <RedirectLoader productID={productID} affilate={affiliate} />;
}
