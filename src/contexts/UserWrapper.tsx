"use client";

import { User } from "@/types";
import React, { createContext, useContext } from "react";

const UserContext = createContext<User | null>(null);

interface UserWrapperProps {
	children: React.ReactNode;
	initialUser: User | null;
}

export default function UserWrapper({ children, initialUser }: UserWrapperProps) {
	return <UserContext.Provider value={initialUser}>{children}</UserContext.Provider>;
}

export function useUser() {
	const user = useContext(UserContext);
	return user;
}
