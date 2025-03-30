import RedirectMesssage from "@/components/redirects/RedirectMesssage";

interface ConfirmPageProps {
	searchParams: Promise<Record<string, string>>;
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
	const params = await searchParams;
	const token = params.token;

	return <RedirectMesssage token={token} />;
}
