import argon2 from "argon2";

import prisma from "../libs/db";

// IDs fixes pour que le seed soit idempotent (upsert par id/email, pas de doublons
// si `npx prisma db seed` est relance plusieurs fois).
const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const USER_ID = "00000000-0000-0000-0000-000000000002";

function calculateReadTime(content: string): string {
	const wordsPerMinute = 200;
	const words = content.trim().split(/\s+/).length;
	const minutes = Math.ceil(words / wordsPerMinute);
	return `${minutes} min`;
}

async function seedUsers() {
	const [adminHash, userHash] = await Promise.all([
		argon2.hash("Admin123!", { type: argon2.argon2id }),
		argon2.hash("User123!", { type: argon2.argon2id }),
	]);

	const admin = await prisma.user.upsert({
		where: { email: "admin@admin.fr" },
		update: {},
		create: {
			id: ADMIN_ID,
			nickname: "admin",
			email: "admin@admin.fr",
			pwdHash: adminHash,
			role: "admin",
		},
	});

	const user = await prisma.user.upsert({
		where: { email: "user@user.fr" },
		update: {},
		create: {
			id: USER_ID,
			nickname: "user",
			email: "user@user.fr",
			pwdHash: userHash,
			role: "user",
		},
	});

	return { admin, user };
}

async function seedInformations(authorId: string) {
	const informations = [
		{
			id: "00000000-0000-0000-0000-000000000101",
			title: "Comprendre le stress",
			description:
				"Les mecanismes physiologiques et psychologiques du stress au quotidien.",
			content:
				"Le stress est une reponse naturelle de l'organisme face a une pression percue, qu'elle soit physique, emotionnelle ou psychologique. A court terme, il mobilise des ressources utiles (attention accrue, energie disponible), mais lorsqu'il devient chronique, il peut avoir des consequences durables sur la sante physique et mentale : troubles du sommeil, anxiete, fatigue, difficultes de concentration. Identifier ses declencheurs et apprendre a reguler sa reponse au stress est une premiere etape essentielle vers un meilleur equilibre de vie.",
			category: "Stress",
			imageURL: "https://placehold.co/800x400?text=Stress",
		},
		{
			id: "00000000-0000-0000-0000-000000000102",
			title: "Les bases de la respiration anti-stress",
			description:
				"Pourquoi et comment la respiration controlee aide a reguler le stress.",
			content:
				"La respiration est l'un des rares processus physiologiques a la fois automatique et controlable volontairement. En ralentissant et en approfondissant sa respiration, on active le systeme nerveux parasympathique, responsable du retour au calme apres une periode de tension. Des techniques simples comme la respiration 4-7-8 ou la coherence cardiaque permettent, en quelques minutes, de faire baisser le rythme cardiaque et de retrouver un etat de detente.",
			category: "Respiration",
			imageURL: "https://placehold.co/800x400?text=Respiration",
		},
		{
			id: "00000000-0000-0000-0000-000000000103",
			title: "Sommeil et sante mentale",
			description: "Le lien entre qualite du sommeil et equilibre psychologique.",
			content:
				"Un sommeil de mauvaise qualite ou insuffisant affecte directement la regulation emotionnelle, la memoire et la capacite a gerer le stress au quotidien. Instaurer une routine de coucher reguliere, limiter les ecrans le soir et pratiquer une activite relaxante avant de dormir (respiration, lecture) sont des leviers simples et efficaces pour ameliorer durablement la qualite du sommeil.",
			category: "Sommeil",
			imageURL: "https://placehold.co/800x400?text=Sommeil",
		},
	];

	for (const info of informations) {
		const { content, ...rest } = info;
		await prisma.information.upsert({
			where: { id: info.id },
			update: {},
			create: {
				...rest,
				content,
				readTime: calculateReadTime(content),
				userId: authorId,
			},
		});
	}
}

async function seedBreathExercices(userId: string) {
	const breathExercices = [
		{
			id: "00000000-0000-0000-0000-000000000201",
			title: "Respiration 4-7-8",
			description:
				"Technique de relaxation : inspiration 4s, blocage 7s, expiration 8s.",
			nb_loops: 4,
			time_inspire: 4,
			time_block: 7,
			time_expire: 8,
		},
		{
			id: "00000000-0000-0000-0000-000000000202",
			title: "Coherence cardiaque",
			description:
				"Respiration reguliere 5s/5s pour stabiliser le rythme cardiaque.",
			nb_loops: 6,
			time_inspire: 5,
			time_block: 0,
			time_expire: 5,
		},
	];

	for (const exercice of breathExercices) {
		await prisma.breathExercices.upsert({
			where: { id: exercice.id },
			update: {},
			create: { ...exercice, userId },
		});
	}
}

async function main() {
	const { admin, user } = await seedUsers();
	await seedInformations(admin.id);
	await seedBreathExercices(user.id);

	console.log("Seed terminee : comptes admin@admin.fr / user@user.fr, informations et exercices de respiration par defaut crees.");
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
