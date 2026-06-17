import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import AppContainer from "./components/AppContainer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CESIZEN",
	description: "Le CESI, votre bien-être, notre priorité.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr">
			<body
				className={`${geistSans.variable} ${geistMono.variable} max-h-full antialiased`}
			>
				<AuthProvider>
					<NavBar />
					<AppContainer>{children}</AppContainer>
				</AuthProvider>
			</body>
		</html>
	);
}
