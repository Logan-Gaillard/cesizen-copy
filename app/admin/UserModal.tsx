"use client";

import { Button, ModalBody, ModalFooter } from "@heroui/react";
import { FormProvider, useForm } from "react-hook-form";
import FormInput from "../components/form/FormInput";
import Flex from "../components/utils/Flex";
import useAdminUsers, { IUser } from "@/context/useAdminUsers";

import {
	registerUser,
	deleteUser,
	updateUser,
	CreateUserData,
	EditUserData,
} from "@/actions/user";
import FormSelect from "../components/form/FormSelect";

interface IModalProps {
	onClose: () => void;
	userId?: string;
	onAdd?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

const UserModalAdd = ({ onClose, onAdd }: IModalProps) => {
	const methods = useForm<CreateUserData>({
		defaultValues: {
			nickname: "",
			email: "",
			password: "",
			role: "user",
		},
	});

	const onSubmit = async (data: CreateUserData) => {
		try {
			await registerUser(data);
			if (onAdd) onAdd();
			onClose();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<FormProvider {...methods}>
			<ModalBody>
				<Flex direction="column" gap="1rem">
					<FormInput name="nickname" label="Pseudo" type="text" />
					<FormInput name="email" label="Email" type="email" />
					<FormInput name="password" label="Mot de passe" type="password" />
					<FormSelect name="role" items={[{ key: "user", value: "Utilisateur" }, { key: "admin", value: "Administrateur" }]} label="Rôle"/>
				</Flex>
			</ModalBody>
			<ModalFooter>
				<Button color="danger" variant="flat" onPress={onClose}>
					Annuler
				</Button>
				<Button
					color="primary"
					onPress={() => methods.handleSubmit(onSubmit)()}
				>
					Enregistrer
				</Button>
			</ModalFooter>
		</FormProvider>
	);
};

const UserModalEdit = ({ onClose, userId, onEdit }: IModalProps) => {
	const { users: adminUsers } = useAdminUsers();
	const user: IUser | undefined = userId ? adminUsers[userId] : undefined;

	const methods = useForm<EditUserData>({
		values: {
			nickname: user?.nickname ?? "",
			email: user?.email ?? "",
			role: user?.role ?? "user",
		},
	});

	if (!user) return null;

	const onSubmit = async (data: EditUserData) => {
		try {
			if (user?.id) {
				await updateUser(user.id, data);
				if (onEdit) onEdit();
				onClose();
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<FormProvider {...methods}>
			<ModalBody>
				<Flex direction="column" gap="1rem">
					<FormInput name="nickname" label="Pseudo" type="text" />
					<FormInput name="email" label="Email" type="email" />
					<FormSelect name="role" items={[{ key: "user", value: "Utilisateur" }, { key: "admin", value: "Administrateur" }]} label="Rôle"/>
				</Flex>
			</ModalBody>
			<ModalFooter>
				<Button color="danger" variant="flat" onPress={onClose}>
					Annuler
				</Button>
				<Button
					color="primary"
					onPress={() => methods.handleSubmit(onSubmit)()}
				>
					Enregistrer
				</Button>
			</ModalFooter>
		</FormProvider>
	);
};

const UserModalDelete = ({ onClose, userId, onDelete }: IModalProps) => {
	const { users: adminUsers } = useAdminUsers();
	const user: IUser | undefined = userId ? adminUsers[userId] : undefined;
	const handleDelete = async () => {
		try {
			if (user?.id) {
				await deleteUser(user.id);
				if (onDelete) onDelete();
				onClose();
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<ModalBody>
				<p>
					Êtes-vous sûr de vouloir supprimer cet utilisateur{" "}
					<strong>{user?.nickname}</strong> ?
				</p>
				<p className="text-sm text-gray-500">Cette action est irréversible.</p>
			</ModalBody>
			<ModalFooter>
				<Button color="default" variant="flat" onPress={onClose}>
					Annuler
				</Button>
				<Button color="danger" onPress={handleDelete}>
					Supprimer
				</Button>
			</ModalFooter>
		</>
	);
};

export { UserModalAdd, UserModalEdit, UserModalDelete };
