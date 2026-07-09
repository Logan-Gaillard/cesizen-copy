module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"scope-enum": [
			2,
			"always",
			[
				"auth", // actions/user.ts, login/register/profile
				"infos", // actions/information.ts, app/actus, app/actu
				"respiration", // app/exercices (exercices de respiration)
				"admin", // app/admin
				"ui", // composants partagés Flex, Title, Form*
				"db", // prisma/schema.prisma, migrations
				"ci", // pipeline CI/CD
				"docker", // Dockerfile, docker-compose
				"iac", // Pulumi
				"deps", // dépendances
				"app", // app/page.tsx, app/layout.tsx, app/globals.css
				"logs", // logs, console.log, console.error
			],
		],
	},
};
