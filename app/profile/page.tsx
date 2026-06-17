"use client";

import {
	changeCurrentUserPassword,
	updateCurrentUserProfile,
} from "@/actions/user";
import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@heroui/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormInput from "../components/form/FormInput";
import Flex from "../components/utils/Flex";
import useIsMobile from "@/context/useIsMobile";
import Title from "../components/utils/Title";

type PersonalInfoFormData = {
	email: string;
	nickname: string;
};

type PasswordFormData = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

const Dashboard = () => {
	const userAuth = useAuth();
	const isMobile = useIsMobile();
	const [personalError, setPersonalError] = useState<string | null>(null);
	const [personalSuccess, setPersonalSuccess] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const personalMethods = useForm<PersonalInfoFormData>({
		defaultValues: {
			email: "",
			nickname: "",
		},
	});

	const passwordMethods = useForm<PasswordFormData>({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		if (!userAuth.data) return;
		personalMethods.reset({
			email: userAuth.data.email,
			nickname: userAuth.data.nickname,
		});
	}, [userAuth.data, personalMethods]);

	if (!userAuth.data) {
		return <div>Loading...</div>;
	}

	const onSubmitPersonal = personalMethods.handleSubmit(async (data) => {
		setPersonalError(null);
		setPersonalSuccess(null);
		setIsSavingProfile(true);

		try {
			const result = await updateCurrentUserProfile(data);
			if (!result.success) {
				setPersonalError(
					result.message || "Erreur lors de la mise à jour du profil.",
				);
				return;
			}

			await userAuth.refreshAuth();
			setPersonalSuccess(result.message || "Profil mis à jour.");
		} finally {
			setIsSavingProfile(false);
		}
	});

	const onSubmitPassword = passwordMethods.handleSubmit(async (data) => {
		setPasswordError(null);
		setPasswordSuccess(null);

		if (data.newPassword !== data.confirmPassword) {
			setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
			return;
		}

		setIsSavingPassword(true);

		try {
			const result = await changeCurrentUserPassword(data);
			if (!result.success) {
				setPasswordError(
					result.message || "Erreur lors du changement de mot de passe.",
				);
				return;
			}

			setPasswordSuccess(result.message || "Mot de passe modifié.");
			passwordMethods.reset({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} finally {
			setIsSavingPassword(false);
		}
	});

	return (
		<Flex direction="column" gap="24px" className="max-w-6xl mx-auto w-full">
			<Flex direction="column" gap="8px">
				<Title size="lg">Mon profil</Title>
				<p className="text-gray-600">
					Bonjour {userAuth.data.nickname}, gérez ici vos informations
					personnelles et la sécurité de votre compte.
				</p>
			</Flex>

			<Flex
				direction={isMobile ? "column" : "row"}
				gap="24px"
				fullWidth
				flexWrap="wrap"
			>
				<Card className="p-8 gap-4 flex-1 min-w-0">
					<Title size="sm" underline>
						Informations personnelles
					</Title>
					<FormProvider {...personalMethods}>
						<Flex direction="column" gap="12px">
							<FormInput
								type="text"
								name="nickname"
								label="Pseudo"
								placeholder="Votre pseudo"
							/>
							<FormInput
								type="email"
								name="email"
								label="Email"
								placeholder="prenom.nom@cesi.fr"
							/>

							{personalError && (
								<p className="text-sm text-danger">{personalError}</p>
							)}
							{personalSuccess && (
								<p className="text-sm text-success">{personalSuccess}</p>
							)}

							<Button
								color="primary"
								onPress={() => onSubmitPersonal()}
								isLoading={isSavingProfile}
							>
								Enregistrer les modifications
							</Button>
						</Flex>
					</FormProvider>
				</Card>

				<Card className="p-8 gap-4 flex-1 min-w-0">
					<Title size="sm" underline>
						Sécurité
					</Title>
					<FormProvider {...passwordMethods}>
						<Flex direction="column" gap="12px">
							<FormInput
								type="password"
								name="currentPassword"
								label="Mot de passe actuel"
								placeholder="••••••••"
							/>
							<FormInput
								type="password"
								name="newPassword"
								label="Nouveau mot de passe"
								placeholder="••••••••"
							/>
							<FormInput
								type="password"
								name="confirmPassword"
								label="Confirmer le nouveau mot de passe"
								placeholder="••••••••"
							/>

							{passwordError && (
								<p className="text-sm text-danger">{passwordError}</p>
							)}
							{passwordSuccess && (
								<p className="text-sm text-success">{passwordSuccess}</p>
							)}

							<Button
								color="primary"
								onPress={() => onSubmitPassword()}
								isLoading={isSavingPassword}
							>
								Changer le mot de passe
							</Button>
						</Flex>
					</FormProvider>
				</Card>
			</Flex>
		</Flex>
	);
};

export default Dashboard;
