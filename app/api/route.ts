import { NextResponse } from "next/server";
import { fetchCurrentUser } from "@/actions/user";

export async function GET() {
	try {
		const user = await fetchCurrentUser();
		if (!user) {
			return NextResponse.json({ user: null }, { status: 401 });
		}
		return NextResponse.json({ user });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
