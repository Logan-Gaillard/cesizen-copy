"use server";

import { cookies } from "next/headers";
import prisma from "@/libs/db";

export async function getSessionUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get("cesi-session")?.value;
	if (!token) return null;

	const session = await prisma.session.findUnique({
		where: { token },
		select: {
			user: {
				select: {
					id: true,
					nickname: true,
					email: true,
					role: true,
				},
			},
		},
	});

	return session?.user || null;
}

export async function getUserNickname() {
	const cookieStore = await cookies();
	const token = cookieStore.get("cesi-session")?.value;

	if (!token) return null;

	const session = await prisma.session.findUnique({
		where: { token },
		select: { user: { select: { nickname: true } } },
	});

	return session?.user.nickname || null;
}

export async function getUserRole() {
	const cookieStore = await cookies();
	const token = cookieStore.get("cesi-session")?.value;
	if (!token) return null;
	const session = await prisma.session.findUnique({
		where: { token },
		select: { user: { select: { role: true } } },
	});
	return session?.user.role || null;
}
