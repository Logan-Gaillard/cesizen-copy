import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "./libs/user.service";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
	console.log("Proxying to API route:", request.url);
	const session = await getSessionUser();

	console.log("Session user:", session);

	if (request.url.includes("/exercices")) {
		if (!session) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	if (request.url.includes("/admin")) {
		if (!session) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
		if (session.role !== "admin") {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/exercices", "/admin"],
};
