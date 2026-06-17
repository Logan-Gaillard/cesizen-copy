"use client";

import { getAllActus } from "@/actions/information";
import { useCallback, useEffect, useState } from "react";
import useAdminUsers from "./useAdminUsers";

export interface IActu {
	id?: string;
	title: string;
	category: string;
	readTime?: string;
	description: string;
	content: string;
	imageURL: string;
	author?: string;
	createdAt?: string;
	updatedAt?: string;
}

const useInformations = () => {
	const [informations, setInformations] = useState<Record<string, IActu>>({});

	const fetchInformations = useCallback(async (): Promise<void> => {
		if (typeof window === "undefined") {
			return;
		}

		try {
			const actus = await getAllActus();
			const sortedInformations = Object.values(actus).sort((a, b) => {
				const dateA = new Date(a.createdAt || "").getTime();
				const dateB = new Date(b.createdAt || "").getTime();
				return dateB - dateA;
			});
			setInformations(
				sortedInformations.reduce(
					(acc, actu) => {
						acc[actu.id || "id"] = actu;
						return acc;
					},
					{} as Record<string, IActu>,
				),
			);
		} catch (error) {
			console.error("Erreur lors de la récupération des informations :", error);
		}
	}, []);

	useEffect(() => {
		fetchInformations();
	}, [fetchInformations]);

	return { informations, fetchInformations };
};

export default useInformations;
