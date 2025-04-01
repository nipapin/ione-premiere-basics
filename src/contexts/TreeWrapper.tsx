"use client";

import { TreeElement } from "@/lib/utils";
import React, { createContext, useContext } from "react";

const TreeContext = createContext<TreeElement[]>([]);

export default function TreeWrapper({ children, tree }: { children: React.ReactNode; tree: TreeElement[] }) {
	return <TreeContext.Provider value={tree}>{children}</TreeContext.Provider>;
}

export function useTree() {
	return useContext(TreeContext);
}
