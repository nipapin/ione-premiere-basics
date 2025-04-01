"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionHandler() {
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch("/api/user");
				const data = await response.json();

				if (!data.user) {
					// If no user data, redirect to login without deleting the session
					router.push("/login");
				}
			} catch (error) {
				console.error("Session check failed:", error);
				router.push("/login");
			}
		};

		checkSession();
	}, [router]);

	return null; // This component doesn't render anything
}
