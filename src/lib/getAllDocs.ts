interface Article {
	slug: string;
	title: string;
	excerpt: string;
	content: string;
}

interface Category {
	id: string;
	title: string;
	articles: Article[];
}

interface DocsData {
	categories: Category[];
}

// Mock data to simulate MDX files
const mockDocs: DocsData = {
	categories: [
		{
			id: "getting-started",
			title: "Getting Started",
			articles: [
				{
					slug: "introduction",
					title: "Introduction",
					excerpt: "Learn about the basics of our documentation system.",
					content:
						"# Introduction\n\nWelcome to our documentation. This is the introduction page."
				},
				{
					slug: "installation",
					title: "Installation",
					excerpt: "How to install and set up the project.",
					content:
						"# Installation\n\nFollow these steps to install the project..."
				},
				{
					slug: "configuration",
					title: "Configuration",
					excerpt: "Configure the system to your needs.",
					content:
						"# Configuration\n\nLearn how to configure the system to your needs."
				}
			]
		},
		{
			id: "core-concepts",
			title: "Core Concepts",
			articles: [
				{
					slug: "architecture",
					title: "Architecture",
					excerpt: "Understanding the system architecture.",
					content:
						"# Architecture\n\nThis page explains the system architecture."
				},
				{
					slug: "data-model",
					title: "Data Model",
					excerpt: "Learn about the data structures.",
					content:
						"# Data Model\n\nUnderstand the data structures used in the system."
				},
				{
					slug: "state-management",
					title: "State Management",
					excerpt: "How state is managed throughout the application.",
					content:
						"# State Management\n\nLearn about state management in the application."
				}
			]
		},
		{
			id: "advanced-topics",
			title: "Advanced Topics",
			articles: [
				{
					slug: "performance",
					title: "Performance Optimization",
					excerpt: "Tips for optimizing performance.",
					content:
						"# Performance Optimization\n\nFollow these tips to optimize performance."
				},
				{
					slug: "security",
					title: "Security",
					excerpt: "Best practices for securing your application.",
					content:
						"# Security\n\nImplement these best practices to secure your application."
				},
				{
					slug: "internationalization",
					title: "Internationalization",
					excerpt: "Supporting multiple languages and regions.",
					content:
						"# Internationalization\n\nLearn how to support multiple languages and regions."
				}
			]
		}
	]
};

// In a real app, this would scan your content directory
export function getAllDocuments(): DocsData {
	return mockDocs;
}

// In a real app, this would read a specific MDX file
export function getDocumentBySlug(slug: string): Article | undefined {
	for (const category of mockDocs.categories) {
		const article = category.articles.find((article) => article.slug === slug);
		if (article) {
			return article;
		}
	}
	return undefined;
}

// In a real app, this would get all available slugs for static generation
export function getAllDocumentSlugs(): string[] {
	const slugs: string[] = [];
	for (const category of mockDocs.categories) {
		for (const article of category.articles) {
			slugs.push(article.slug);
		}
	}
	return slugs;
}
