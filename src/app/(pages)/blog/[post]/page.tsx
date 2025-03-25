interface BlogPostPageProps {
	params: Promise<{ post: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { post } = await params;
	return <div>{post} page</div>;
}
