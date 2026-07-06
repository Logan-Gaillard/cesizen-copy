import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export async function GET() {
	const commitSha =
		process.env.NODE_ENV === "production"
			? process.env.GIT_COMMIT_SHA!.slice(0, 7)
			: "dev";

	return NextResponse.json({
		status: "ok",
		version: packageJson.version,
		commitSha,
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
}
