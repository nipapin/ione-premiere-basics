"use client";

import React from "react";

const NavBarBoundingContext = React.createContext<number>(0);

export default function NavBarBoundingProvider({ children }: { children: React.ReactNode }) {
	const [bounding, setBounding] = React.useState<number>(0);

	React.useEffect(() => {
		const header = document.querySelector("header");
		setBounding(header?.clientHeight ?? 0);
	}, []);

	return <NavBarBoundingContext.Provider value={bounding}>{children}</NavBarBoundingContext.Provider>;
}

export const useNavBarBounding = () => React.useContext(NavBarBoundingContext);
