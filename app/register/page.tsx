"use client";

import { FormProvider, useForm } from "react-hook-form";
import FormInput from "../components/form/FormInput";
import FormCard from "../components/form/FormCard";
import { Button } from "@heroui/react";
import { registerUser } from "../../actions/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormData = {
	nickname: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const Register = () => {
	const methods = useForm<FormData>({
		defaultValues: {
			nickname: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const router = useRouter();
	const { handleSubmit } = methods;
	const [error, setError] = useState<{ message: string }>();

	const onSubmit = handleSubmit(async (data) => {
		if (data.password !== data.confirmPassword) {
			setError({ message: "Les mots de passe ne correspondent pas." });
			return;
		}
		const result = await registerUser(data);
		if (result.success) {
			router.push("/login");
		} else {
			setError({
				message:
					result.message || "Une erreur est survenue lors de l'inscription.",
			});
		}
		console.log(result);
	});

	return (
		<div className="flex w-full h-full items-center justify-center p-4">
			<FormCard
				isLogin={false}
				titleCard="Inscription"
				descriptionCard="Créez un compte pour accéder à toutes les fonctionnalités de votre espace personnel."
			>
				<FormProvider {...methods}>
					<div className="mb-6 flex flex-col items-center gap-4">
						<FormInput
							type="text"
							name="nickname"
							label="Nom d'utilisateur"
							placeholder="Votre nom d'utilisateur"
						/>

						<FormInput
							type="email"
							name="email"
							label="E-mail"
							placeholder="prenom.nom@cesi.fr"
						/>

						<FormInput
							type="password"
							name="password"
							label="Mot de passe"
							placeholder="••••••••"
						/>
						<FormInput
							type="password"
							name="confirmPassword"
							label="Confirmez le mot de passe"
							placeholder="••••••••"
						/>
					</div>

					{error && (
						<div className="mb-4 w-full rounded bg-red-100 p-3 text-sm text-red-700">
							{error.message}
						</div>
					)}

					<Button
						type="submit"
						onPress={() => onSubmit()}
						className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-wide text-[color:var(--color-primary-600)] shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:text-[color:var(--color-secondary-700)]"
					>
						{"S'inscrire"}
					</Button>
				</FormProvider>
			</FormCard>
		</div>
	);
};

export default Register;
