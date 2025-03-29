interface HelpPageProps {
	params: Promise<{ article: string }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
	const { article } = await params;
	return <div>HelpPage about {article}</div>;
}
