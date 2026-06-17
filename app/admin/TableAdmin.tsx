"use client";

import { IUser } from "@/context/useAdminUsers";
import { IActu } from "@/context/useInformations";
import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import Flex from "../components/utils/Flex";
import { IExercise } from "../exercices/page";

const columns = {
	users: [
		{ key: "nickname", label: "Pseudo" },
		{ key: "email", label: "Email" },
		{ key: "role", label: "Rôle" },
		{ key: "actions", label: "Actions" },
	],
	infos: [
		{ key: "title", label: "Titre" },
		{ key: "category", label: "Catégorie" },
		{ key: "author", label: "Auteur" },
		{ key: "actions", label: "Actions" },
	],
	exos: [
		{ key: "title", label: "Titre" },
		{ key: "description", label: "Description" },
		{ key: "actions", label: "Actions" },
	],
};

const TableAdmin = ({
	data,
	type,
	openModal,
}: {
	data:
		| Record<string, IUser>
		| Record<string, IActu>
		| Record<string, IExercise>;
	type: "users" | "infos" | "exos";
	openModal: (type: "add" | "edit" | "delete", itemId?: string) => void;
}) => {
	return (
		<Table aria-label="Tableau des actualités">
			<TableHeader columns={columns[type]}>
				{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
			</TableHeader>
			<TableBody items={Object.values(data)}>
				{(item) => (
					<TableRow key={item.id}>
						{columns[type].map((column) => (
							<TableCell key={column.key}>
								{column.key === "actions" ? (
									<Flex display="inline-flex" gap="0.5rem">
										{/* <Button
											variant="light"
											color="primary"
											size="sm"
											isIconOnly
											// onPress={() => onView(item)}
										>
											<Visibility />
										</Button> */}
										<Button
											variant="light"
											color="primary"
											size="sm"
											isIconOnly
											onPress={() => openModal?.("edit", item.id)}
										>
											<Edit />
										</Button>
										<Button
											variant="light"
											color="danger"
											size="sm"
											isIconOnly
											onPress={() => openModal?.("delete", item.id)}
										>
											<Delete />
										</Button>
									</Flex>
								) : (
									item[column.key as keyof typeof item]
								)}
							</TableCell>
						))}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};

export default TableAdmin;
