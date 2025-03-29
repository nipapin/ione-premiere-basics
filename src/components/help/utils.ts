export const getBreadcrumbs = (pathname: string) =>
	pathname.split("/").filter(Boolean);

export const convertChunkToTypo = (chunk: string) =>
	chunk.replace(/-/g, " ").charAt(0).toUpperCase() +
	chunk.replace(/-/g, " ").slice(1);
