"use client";

import { getSessionUser } from "@/libs/user.service";
import { useEffect, useState } from "react";

const useIsAdmin = (): boolean => {
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const updateRole = async (): Promise<void> => {
			const session = await getSessionUser();
			if (session && session.role === "admin") {
				setIsAdmin(true);
			} else {
				setIsAdmin(false);
			}
		};

		updateRole();
		window.addEventListener("storage", updateRole);

		return (): void => {
			window.removeEventListener("storage", updateRole);
		};
	}, []);

	return isAdmin;
};

export default useIsAdmin;
