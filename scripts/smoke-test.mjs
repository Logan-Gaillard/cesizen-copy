// Smoke test post-deploiement : verifie que l'application repond correctement.
// Usage: node scripts/smoke-test.mjs [url]
const url = process.argv[2] || "http://localhost:3000/api/health";

try {
	const res = await fetch(url);

	if (!res.ok) {
		console.error(`Smoke test ECHEC : HTTP ${res.status}`);
		process.exit(1);
	}

	const body = await res.json();

	if (body.status !== "ok") {
		console.error(`Smoke test ECHEC : status = "${body.status}" (attendu "ok")`);
		process.exit(1);
	}

	console.log(`Smoke test OK : ${url}`, body);
	process.exit(0);
} catch (error) {
	console.error(`Smoke test ECHEC : ${error.message}`);
	process.exit(1);
}
