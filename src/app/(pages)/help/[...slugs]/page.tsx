interface HelpPageProps {
	params: Promise<{ slugs: string[] }>;
}

export default async function HelpPage({ params }: HelpPageProps) {
	const {
		slugs: [category, article]
	} = await params;
	return (
		<div>
			HelpPage about {article} in {category}
		</div>
	);
}
