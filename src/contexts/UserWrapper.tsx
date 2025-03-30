"use client";

import Preloader from "@/components/layout/Preloader";
import { User } from "@/types";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<User | null>(null);

interface UserWrapperProps {
	children: React.ReactNode;
}

export default function UserWrapper({ children }: UserWrapperProps) {
	const [user, setUser] = useState<User | null>(null);
	const [pending, setPending] = useState(true);
	const pathname = usePathname();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/user");
				const data = await response.json();

				if (!data.user) {
					setUser(null);
					return;
				}

				setUser(data.user);
			} catch (error) {
				console.error("Error fetching user:", error);
				setUser(null);
			} finally {
				setPending(false);
			}
		};

		fetchUser();
	}, [pathname]);

	if (pending) {
		return <Preloader />;
	}

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
	const user = useContext(UserContext);
	return user;
}
