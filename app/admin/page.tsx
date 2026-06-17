"use client";

import Flex from "@/app/components/utils/Flex";
import Title from "@/app/components/utils/Title";
import {
	Button,
	Chip,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Tab,
	Tabs,
	useDisclosure,
} from "@heroui/react";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import { IExercise } from "../exercices/page";
import useInformations from "@/context/useInformations";
import useAdminUsers from "@/context/useAdminUsers";
import TableAdmin from "./TableAdmin";
import { UserModalAdd, UserModalDelete, UserModalEdit } from "./UserModal";
import { InfoModalAdd, InfoModalDelete, InfoModalEdit } from "./InfoModal";

const Admin = () => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [currentTab, setCurrentTab] = useState<string>("members");
	const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(
		null,
	);
	const [selectedItem, setSelectedItem] = useState<string>();

	const { users, fetchUsers } = useAdminUsers();
	const { informations, fetchInformations } = useInformations();

	const handleOpenModal = ({
		type,
		itemId,
	}: {
		type: "add" | "edit" | "delete";
		itemId?: string;
	}) => {
		setModalType(type);
		setSelectedItem(itemId);
		onOpen();
	};

	const handleRefresh = () => {
		fetchUsers();
		fetchInformations();
	};

	const renderModalContent = (onClose: () => void) => {
		if (currentTab === "members") {
			switch (modalType) {
				case "add":
					return <UserModalAdd onClose={onClose} onAdd={handleRefresh} />;
				case "edit":
					return (
						<UserModalEdit
							onClose={onClose}
							onEdit={handleRefresh}
							userId={selectedItem}
						/>
					);
				case "delete":
					return (
						<UserModalDelete
							onClose={onClose}
							onDelete={handleRefresh}
							userId={selectedItem}
						/>
					);
			}
		} else if (currentTab === "actus") {
			switch (modalType) {
				case "add":
					return <InfoModalAdd onClose={onClose} onAdd={handleRefresh} />;
				case "edit":
					return (
						<InfoModalEdit
							onClose={onClose}
							onEdit={handleRefresh}
							infoId={selectedItem}
						/>
					);
				case "delete":
					return (
						<InfoModalDelete
							onClose={onClose}
							onDelete={handleRefresh}
							infoId={selectedItem}
						/>
					);
			}
		}

		return (
			<>
				<ModalBody>
					<p>Fonctionnalité à venir pour {currentTab}</p>
				</ModalBody>
				<ModalFooter>
					<Button onPress={onClose}>Fermer</Button>
				</ModalFooter>
			</>
		);
	};

	return (
		<Flex direction="column" gap className="max-w-6xl mx-auto w-full">
			<Flex justifyContent="space-between" alignItems="center">
				<Title size="lg">Administration</Title>
			</Flex>

			<Tabs
				aria-label="Options"
				color="primary"
				variant="underlined"
				classNames={{
					tabList:
						"gap-6 w-full relative rounded-none p-0 border-b border-divider",
					cursor: "w-full bg-primary",
					tab: "max-w-fit px-0 h-12",
					tabContent: "group-data-[selected=true]:text-primary font-semibold",
				}}
				selectedKey={currentTab}
				onSelectionChange={(key) => setCurrentTab(key as string)}
			>
				{/* --- Onglet Membres --- */}
				<Tab
					key="members"
					title={
						<div className="flex items-center space-x-2">
							<span>Membres</span>
							<Chip size="sm" variant="faded">
								{Object.keys(users).length}
							</Chip>
						</div>
					}
				>
					<Flex direction="column" gap="1rem" className="mt-4" fullWidth>
						<Flex justifyContent="flex-end" alignItems="center">
							<Button
								color="primary"
								endContent={<Add />}
								onPress={() => handleOpenModal({ type: "add" })}
							>
								Ajouter un membre
							</Button>
						</Flex>
						<TableAdmin
							data={users}
							type="users"
							openModal={(type, itemId) => handleOpenModal({ type, itemId })}
						/>
					</Flex>
				</Tab>

				{/* --- Onglet Actualités --- */}
				<Tab
					key="actus"
					title={
						<div className="flex items-center space-x-2">
							<span>Actualités</span>
							<Chip size="sm" variant="faded">
								{Object.keys(informations).length}
							</Chip>
						</div>
					}
				>
					<Flex fullWidth direction="column" gap="1rem" className="mt-4">
						<Flex justifyContent="flex-end" alignItems="center">
							<Button
								color="primary"
								endContent={<Add />}
								onPress={() => handleOpenModal({ type: "add" })}
							>
								Ajouter une actualité
							</Button>
						</Flex>
						<TableAdmin
							data={informations}
							type="infos"
							openModal={(type, itemId) => handleOpenModal({ type, itemId })}
						/>
					</Flex>
				</Tab>

				{/* --- Onglet Exercices --- */}
				{/* <Tab
					key="exos"
					title={
						<div className="flex items-center space-x-2">
							<span>Exercices</span>
							<Chip size="sm" variant="faded">
								{Object.keys(exercises).length}
							</Chip>
						</div>
					}
				>
					<Flex direction="column" gap="1rem" className="mt-4">
						<Flex justifyContent="flex-end" alignItems="center">
							<Button
								color="primary"
								endContent={<Add />}
								//onPress={() => handleOpenModal("add")}
							>
								Ajouter un exercice
							</Button>
						</Flex>
						<TableAdmin
							data={exercises}
							type="exos"
							openModal={(type, itemId) => handleOpenModal({ type, itemId })}
						/>
					</Flex>
				</Tab>*/}
			</Tabs>

			{/* --- Modal Global --- */}
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								{modalType === "add"
									? "Ajouter"
									: modalType === "edit"
										? "Modifier"
										: "Supprimer"}{" "}
								{currentTab === "actus"
									? "une actualité"
									: currentTab === "exos"
										? "un exercice"
										: "un membre"}
							</ModalHeader>
							{renderModalContent(onClose)}
						</>
					)}
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default Admin;
