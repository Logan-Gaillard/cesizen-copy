"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import Flex from "../utils/Flex";

const FormCard = ({
	children,
	titleCard,
	descriptionCard,
	isLogin,
}: {
	children: React.ReactNode;
	titleCard: string;
	descriptionCard: string;
	isLogin?: boolean;
}) => {
	const router = useRouter();

	return (
		<Flex direction="column" alignContent="center" justifyContent="center" className="rounded-2xl border border-white/80 bg-white/95 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur">
			<div className="px-8 pt-10 pb-8">
				<div className="mb-8 text-center">
					<h1 className="mt-3 text-3xl font-bold text-primary-700">
						{titleCard}
					</h1>
					<p className="mt-2 text-sm text-slate-600">{descriptionCard}</p>
				</div>
				{children}
			</div>
			{isLogin ? (
				<div className="rounded-b-2xl border-t border-slate-100 bg-slate-50/80 px-8 py-5 text-center text-xs text-slate-500">
					Vous ne possédez pas de compte ?{" "}
					<Button
						variant="light"
						type="button"
						color="primary"
						onPress={() => router.push("/register")}
					>
						Inscrivez-vous
					</Button>
				</div>
			) : (
				<div className="rounded-b-2xl border-t border-slate-100 bg-slate-50/80 px-8 py-5 text-center text-xs text-slate-500">
					Vous possédez déjà un compte ?{" "}
					<Button
						variant="light"
						type="button"
						color="primary"
						size="sm"
						onPress={() => router.push("/login")}
					>
						Connectez-vous
					</Button>
				</div>
			)}
		</Flex>
	);
};

export default FormCard;
