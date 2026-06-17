"use client";

import { getAllUsers } from "@/actions/user";
import { useCallback, useEffect, useState } from "react";

export interface IUser {
	id: string;
	nickname: string;
	email?: string;
	role?: string;
}

const useAdminUsers = () => {
	const [users, setUsers] = useState<Record<string, IUser>>({});

	const fetchUsers = useCallback(async (): Promise<void> => {
		if (typeof window === "undefined") {
			return;
		}
		try {
			const data = await getAllUsers();
			const usersMap: Record<string, IUser> = {};
			data.forEach((user) => {
				usersMap[user.id] = user;
			});
			setUsers(usersMap);
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des informations :",
				error,
			);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return { users, fetchUsers };
};

export default useAdminUsers;
