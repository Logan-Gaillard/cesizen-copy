"use client";
import { Button } from "@heroui/react";
import { FormProvider, useForm } from "react-hook-form";
import { loginUser } from "../../actions/user";
import FormCard from "../components/form/FormCard";
import FormCheckbox from "../components/form/FormCheckbox";
import FormInput from "../components/form/FormInput";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useIsMobile from "../../context/useIsMobile";

type FormData = {
	email: string;
	password: string;
	rememberMe: boolean;
};

const Login = () => {
	const router = useRouter();
	const isMobile = useIsMobile();
	const userAuth = useAuth();

	const [error, setError] = useState<{ message: string } | null>(null);

	const methods = useForm<FormData>({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
	});

	const { handleSubmit } = methods;

	const onSubmit = handleSubmit(async (data: FormData) => {
		console.log(data);
		const result = await loginUser(data.email, data.password, data.rememberMe);

		if (result.success) {
			await userAuth.refreshAuth();
			router.push("/");
		} else {
			setError({
				message:
					result.message || "Une erreur est survenue lors de la connexion.",
			});
		}
		console.log(result);
	});

	return (
		<div className="flex flex-col w-full h-full items-center justify-center p-4">

				<FormCard
					titleCard="Connexion"
					descriptionCard="Connectez-vous pour exploiter toutes les fonctionnalités de votre espace personnel."
					isLogin={true}
				>
					<FormProvider {...methods}>
						<div className="mb-6 flex flex-col items-center gap-4">
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
						</div>

						<FormCheckbox
							name="rememberMe"
							label="Se souvenir de moi"
							required={false}
						/>

						{error && (
							<p className="mt-4 text-sm text-red-600">
								Erreur lors de la connexion : {error.message}
							</p>
						)}

						<Button
							type="submit"
							className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-600 shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:text-secondary-700"
							onPress={() => onSubmit()}
						>
							Se connecter
						</Button>
					</FormProvider>
				</FormCard>

		</div>
	);
};

export default Login;
