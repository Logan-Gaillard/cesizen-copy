"use client";

import Flex from "@/app/components/utils/Flex";
import Title from "@/app/components/utils/Title";
import useInformations from "@/context/useInformations";
import { Avatar, Chip, Divider, Image } from "@heroui/react";
import * as React from "react";

interface IAuthor {
	id: string;
	name: string;
	role: string;
}

const ActuId = ({ params }: { params: Promise<{ id: string }> }) => {
	const { informations } = useInformations();

	const { id }: { id: string } = React.use(params);
	const currentActu = informations[id];

	if (!currentActu) {
		return <div>Article non trouvé</div>;
	}

	console.log("Informations actu:", currentActu);

	return (
		<Flex direction="column" gap="1rem" className="max-w-6xl mx-auto w-full">
			{/* Header Section */}
			<Flex direction="column" className="gap-4 mb-4">
				<Flex alignItems="center" gap="0.5rem">
					<Chip
						color="primary"
						variant="flat"
						size="sm"
						className="uppercase font-bold tracking-wider"
					>
						{currentActu.category}
					</Chip>
					<span className="text-gray-400 text-sm">•</span>
					<span className="text-gray-500 text-sm font-medium">
						{currentActu.readTime} de lecture
					</span>
				</Flex>
			</Flex>

			{/* Author & Meta */}
			<Flex
				alignItems="center"
				justifyContent="space-between"
				className="border-b border-gray-200 pb-6 mb-8"
			>
				<Title
					size="lg"
					className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight"
				>
					{currentActu.title}
				</Title>
				<div className="text-right hidden sm:block">
					<p className="text-xs text-gray-500 uppercase tracking-wide">
						Publié le
					</p>
					<p className="text-sm font-medium text-gray-900">
						{new Date(currentActu?.createdAt || 0).toLocaleDateString("fr-FR", {
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</p>
				</div>
			</Flex>

			{/* Main Content Layout */}
			<Flex gap="2rem" className="lg:flex-row" flexWrap="wrap">
				{/* Article Body */}
				<div className="flex-1 space-y-8">
					<p className="text-xl text-gray-600 font-serif leading-relaxed border-l-4 border-primary pl-4 italic">
						{currentActu.description}
					</p>

					<div className="prose prose-lg max-w-none text-gray-800">
						{currentActu.content.split("\n\n").map((paragraph, idx) => (
							<p
								key={`${currentActu.id}-paragraph-${idx}`}
								className="mb-6 leading-relaxed"
							>
								{paragraph}
							</p>
						))}
					</div>
				</div>

				{/* Sidebar / Visuals */}
				<Flex direction="column" className="w-full lg:w-1/3 gap-6">
					<div className="sticky top-24 space-y-4">
						<Image
							alt={currentActu.title}
							className="w-full aspect-4/3 object-cover"
							radius="lg"
							shadow="sm"
							src={currentActu.imageURL || "/placeholder_img.png"}
							width="100%"
						/>
						<p className="text-xs text-center text-gray-400 italic">
							Illustration : {currentActu.title}
						</p>

						<Divider className="my-4" />

						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-sm font-semibold text-gray-700 mb-2">
								À propos
							</p>
							<p className="text-xs text-gray-600">
								Cet article a été rédigé par{" "}
								{currentActu.author || "Utilisateur inconnu"}
							</p>
							<p className="text-xs text-gray-600">
								Publié le{" "}
								{new Date(currentActu?.createdAt || 0).toLocaleDateString(
									"fr-FR",
									{
										day: "numeric",
										month: "long",
										year: "numeric",
									},
								)}
							</p>
						</div>
					</div>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default ActuId;
