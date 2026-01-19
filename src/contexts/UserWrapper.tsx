"use client";

import { get } from "@/actions/user";
import { User } from "@/types/interfaces";
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<User | null>(null);

interface UserWrapperProps {
	children: React.ReactNode;
	initialUser: User | null;
	userID: string | undefined;
}

export default function UserWrapper({ children, initialUser, userID }: UserWrapperProps) {
	const [user, setUser] = useState<User | null>(initialUser);

	useEffect(() => {
		const user_id = userID || localStorage.getItem("ops");

		if (!user_id) {
			setUser(null);
			return;
		}

		if (!initialUser) {
			localStorage.setItem("ops", user_id);
			get(user_id).then((user) => {
				setUser(user);
			});
		}
	}, [initialUser, userID]);

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
	const user = useContext(UserContext);
	return user;
}
