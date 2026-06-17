"use server";

import argon2 from "argon2";

import prisma from "@/libs/db";
import { cookies } from "next/headers";
import { getSessionUser } from "@/libs/user.service";

export type CreateUserData = {
	nickname: string;
	email: string;
	password: string;
	role?: string;
	confirmPassword?: string;
};

export type EditUserData = {
	nickname: string;
	email: string;
	role: string;
};

export type UpdateCurrentProfileData = {
	nickname: string;
	email: string;
};

export type ChangeCurrentPasswordData = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export async function registerUser(data: CreateUserData) {
	if (data.password !== data.confirmPassword) {
		return {
			success: false,
			message: "Les mots de passe ne correspondent pas.",
		};
	}

	const hash = await argon2.hash(data.password, {
		type: argon2.argon2id,
	});

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ nickname: data.nickname }, { email: data.email }],
		},
	});

	if (existingUser) {
		const isNickname = existingUser.nickname === data.nickname;
		return {
			success: false,
			message: isNickname
				? "Un utilisateur avec ce nom d'utilisateur existe déjà"
				: "Un utilisateur avec cet email existe déjà",
		};
	}

	const user = await prisma.user.create({
		data: {
			nickname: data.nickname,
			email: data.email,
			pwdHash: hash,
			role: data.role || "user",
		},
	});

	if (!user) {
		return {
			success: false,
			message: "Erreur lors de la création de l'utilisateur",
		};
	}
	return { success: true, user };
}

export async function loginUser(
	email: string,
	password: string,
	rememberMe: boolean,
) {
	const user = await prisma.user.findUnique({ where: { email } });

	if (!user)
		return { success: false, message: "Email ou mot de passe invalide" };

	const isValid = await argon2.verify(user.pwdHash, password);
	if (!isValid)
		return { success: false, message: "Email ou mot de passe invalide" };

	const session = await prisma.session.create({
		data: {
			token: crypto.randomUUID().toString(),
			userId: user.id,
		},
	});

	const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;

	const cookieStore = await cookies();

	cookieStore.set({
		name: "cesi-session",
		value: session.token,
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
		maxAge,
	});

	return { success: true };
}

export async function logoutUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get("cesi-session")?.value;
	if (token) {
		await prisma.session.deleteMany({ where: { token } });
		cookieStore.delete("cesi-session");
	}
}

export async function fetchCurrentUser() {
	try {
		const user = await getSessionUser();
		if (!user) return null;

		// On ne renvoie que ce qui est nécessaire (pas le mot de passe !)
		return { nickname: user.nickname };
	} catch {
		return null;
	}
}

export async function getAllUsers() {
	const currentUser = await getSessionUser();
	if (!currentUser || currentUser.role !== "admin") {
		throw new Error("Unauthorized");
	}

	const users = await prisma.user.findMany({
		select: {
			id: true,
			nickname: true,
			email: true,
			role: true,
		},
	});

	return users;
}

export async function getNameById(id: string) {
	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			nickname: true,
		},
	});

	return user?.nickname || "Inconnu";
}

export async function deleteUser(id: string) {
	const currentUser = await getSessionUser();
	if (!currentUser || currentUser.role !== "admin") {
		throw new Error("Unauthorized");
	}

	await prisma.user.delete({ where: { id } });
}

export async function updateUser(id: string, data: Partial<CreateUserData>) {
	const currentUser = await getSessionUser();
	if (!currentUser || currentUser.role !== "admin") {
		throw new Error("Unauthorized");
	}

	const hash = await argon2.hash(data.password || "", {
		type: argon2.argon2id,
	});

	await prisma.user.update({
		where: { id },
		data: {
			nickname: data.nickname,
			email: data.email,
			pwdHash: hash,
		},
	});
}

export async function changeUserRole(id: string, role: string) {
	const currentUser = await getSessionUser();
	if (!currentUser || currentUser.role !== "admin") {
		throw new Error("Unauthorized");
	}

	await prisma.user.update({
		where: { id },
		data: {
			role,
		},
	});
}

export async function updateCurrentUserProfile(data: UpdateCurrentProfileData) {
	const currentUser = await getSessionUser();
	if (!currentUser) {
		return { success: false, message: "Utilisateur non authentifié." };
	}

	const nickname = data.nickname.trim();
	const email = data.email.trim().toLowerCase();

	if (!nickname || !email) {
		return {
			success: false,
			message: "Le pseudo et l'email sont requis.",
		};
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ nickname }, { email }],
			NOT: { id: currentUser.id },
		},
	});

	if (existingUser) {
		const isNickname = existingUser.nickname === nickname;
		return {
			success: false,
			message: isNickname
				? "Ce pseudo est déjà utilisé."
				: "Cet email est déjà utilisé.",
		};
	}

	await prisma.user.update({
		where: { id: currentUser.id },
		data: {
			nickname,
			email,
		},
	});

	return {
		success: true,
		message: "Informations personnelles mises à jour.",
	};
}

export async function changeCurrentUserPassword(
	data: ChangeCurrentPasswordData,
) {
	const currentUser = await getSessionUser();
	if (!currentUser) {
		return { success: false, message: "Utilisateur non authentifié." };
	}

	if (data.newPassword !== data.confirmPassword) {
		return {
			success: false,
			message: "Les nouveaux mots de passe ne correspondent pas.",
		};
	}

	if (data.currentPassword === data.newPassword) {
		return {
			success: false,
			message: "Le nouveau mot de passe doit être différent de l'actuel.",
		};
	}

	const user = await prisma.user.findUnique({
		where: { id: currentUser.id },
		select: { pwdHash: true },
	});

	if (!user) {
		return { success: false, message: "Utilisateur introuvable." };
	}

	const isCurrentValid = await argon2.verify(
		user.pwdHash,
		data.currentPassword,
	);
	if (!isCurrentValid) {
		return {
			success: false,
			message: "Le mot de passe actuel est incorrect.",
		};
	}

	const newHash = await argon2.hash(data.newPassword, {
		type: argon2.argon2id,
	});

	await prisma.user.update({
		where: { id: currentUser.id },
		data: { pwdHash: newHash },
	});

	return {
		success: true,
		message: "Mot de passe modifié avec succès.",
	};
}
