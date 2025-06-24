import RedirectLoader from "./components/RedirectLoader";

interface ChargePaymentPageProps {
	searchParams: Promise<{ after: string }>;
}

export default async function ChargePaymentPage({ searchParams }: ChargePaymentPageProps) {
	const { after } = await searchParams;
	const productID = Buffer.from(after, "base64").toString("utf-8");

	return <RedirectLoader productID={productID} />;
}
