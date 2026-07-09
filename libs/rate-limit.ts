import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000;

// Recuperation best-effort de l'IP du client via les en-tetes transmis par
// le reverse proxy (le serveur Next n'a pas acces au socket TCP dans une
// server action).
export async function getClientIp(): Promise<string> {
	const headersList = await headers();
	const forwarded = headersList.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0].trim();
	return headersList.get("x-real-ip") ?? "unknown";
}

function sweepExpired(now: number) {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}

// Limiteur de debit en memoire (fenetre fixe). Suffisant pour un seul
// conteneur applicatif ; a remplacer par un store partage (Redis) si
// l'app est un jour repartie sur plusieurs instances.
export function checkRateLimit(
	key: string,
	limit: number = DEFAULT_LIMIT,
	windowMs: number = DEFAULT_WINDOW_MS,
): { allowed: boolean; retryAfterSeconds: number } {
	const now = Date.now();
	if (Math.random() < 0.01) sweepExpired(now);

	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfterSeconds: 0 };
	}

	if (bucket.count >= limit) {
		return {
			allowed: false,
			retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
		};
	}

	bucket.count += 1;
	return { allowed: true, retryAfterSeconds: 0 };
}
