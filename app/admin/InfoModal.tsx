"use client";

import { Button, ModalBody, ModalFooter } from "@heroui/react";
import { FormProvider, useForm } from "react-hook-form";
import FormInput from "../components/form/FormInput";
import Flex from "../components/utils/Flex";

import { createActu, deleteActu, updateActu } from "@/actions/information";
import useInformations, { IActu } from "@/context/useInformations";
import FormTextArea from "../components/form/FormTextArea";

interface IModalProps {
	onClose: () => void;
	infoId?: string;
	onAdd?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

const InfoModalAdd = ({ onClose, onAdd }: IModalProps) => {
	const methods = useForm({
		defaultValues: {
			title: "",
			description: "",
			content: "",
			category: "",
			imageURL: "",
		},
	});

	const onSubmit = async (data: IActu) => {
		try {
			await createActu(data);
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
					<FormInput name="title" label="Titre" type="text" />
					<FormInput
						name="description"
						label="Courte description"
						type="text"
					/>
					<FormTextArea name="content" label="Contenu" type="text" />
					<FormInput name="category" label="Catégorie" type="text" />
					<FormInput
						name="imageURL"
						label="URL de l'image"
						type="text"
						required={false}
					/>
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

const InfoModalEdit = ({ onClose, infoId, onEdit }: IModalProps) => {
	const { informations: infos } = useInformations();
	const info: IActu | undefined = infoId ? infos[infoId] : undefined;

	const methods = useForm({
		values: {
			title: info?.title ?? "",
			description: info?.description ?? "",
			content: info?.content ?? "",
			category: info?.category ?? "",
			imageURL: info?.imageURL ?? "",
		},
	});

	if (!info) return null;

	const onSubmit = async (data: IActu) => {
		try {
			if (info?.id) {
				await updateActu(info.id, data);
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
					<FormInput name="title" label="Titre" type="text" />
					<FormInput name="description" label="Description" type="text" />
					<FormTextArea name="content" label="Contenu" type="text" />
					<FormInput name="category" label="Catégorie" type="text" />
					<FormInput
						name="imageURL"
						label="URL de l'image"
						type="text"
						required={false}
					/>
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

const InfoModalDelete = ({ onClose, infoId, onDelete }: IModalProps) => {
	const { informations: infos } = useInformations();
	const info: IActu | undefined = infoId ? infos[infoId] : undefined;
	const handleDelete = async () => {
		try {
			if (info?.id) {
				await deleteActu(info.id);
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
					Êtes-vous sûr de vouloir supprimer l'actualité{" "}
					<strong>{info?.title}</strong> ?
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

export { InfoModalAdd, InfoModalEdit, InfoModalDelete };
