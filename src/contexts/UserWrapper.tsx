"use client";

import Preloader from "@/components/layout/Preloader";
import { User } from "@/types";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
	user: User | null;
	pending: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, pending: true });

interface UserWrapperProps {
	children: React.ReactNode;
}

export default function UserWrapper({ children }: UserWrapperProps) {
	const [user, setUser] = useState<User | null>(null);
	const [pending, setPending] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setPending(true);
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

	if (pending && user) {
		return <Preloader />;
	}

	return <UserContext.Provider value={{ user, pending }}>{children}</UserContext.Provider>;
}

export function useUser() {
	const user = useContext(UserContext);
	return user;
}
