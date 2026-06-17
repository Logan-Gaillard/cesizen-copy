"use server";

import { IActu } from "@/context/useInformations";
import prisma from "@/libs/db";
import { getSessionUser } from "@/libs/user.service";

function calculateReadTime(content: string): string {
	const wordsPerMinute = 200; // Vitesse de lecture moyenne
	const words = content.trim().split(/\s+/).length; // Nombre de mots
	const minutes = Math.ceil(words / wordsPerMinute); // Temps de lecture en minutes
	return `${minutes} min`;
}

export async function createActu({
	title,
	description,
	content,
	category,
	imageURL,
}: IActu) {
	const user = await getSessionUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const authorId = user.id;
	const readTime = calculateReadTime(content || "");

	const newActu = await prisma.information.create({
		data: {
			title,
			description,
			content,
			category,
			imageURL,
			readTime,
			user: {
				connect: {
					id: authorId,
				},
			},
		},
	});
}

export async function getAllActus(): Promise<IActu[]> {
	const actus = await prisma.information.findMany({
		orderBy: { createdAt: "desc" },
	});

	const users = await prisma.user.findMany({
		where: {
			informations: {
				some: {
					id: {
						in: actus.map((actu) => actu.id),
					},
				},
			},
		},
	});

	return actus.map((actu) => ({
		id: actu.id,
		title: actu.title,
		category: actu.category,
		readTime: actu.readTime,
		description: actu.description,
		content: actu.content,
		imageURL: actu.imageURL,
		author:
			users.find((user) => user.id === actu.userId)?.nickname ||
			"Non renseigné",
		createdAt: actu.createdAt.toISOString(),
		updatedAt: actu.updatedAt.toISOString(),
	}));
}

export async function getActuById(id: string) {
	return await prisma.information.findUnique({
		where: { id },
	});
}

export async function deleteActu(id: string) {
	await prisma.information.delete({ where: { id } });
}

export async function updateActu(
	id: string,
	{ title, description, content, category, imageURL }: IActu,
) {
	const readTime = calculateReadTime(content);
	await prisma.information.update({
		where: { id },
		data: {
			title,
			description,
			content,
			category,
			imageURL,
			readTime,
		},
	});
}
