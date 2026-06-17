"use client";

import { Card, CardHeader, CardBody, Image } from "@heroui/react";
import { CalendarToday } from "@mui/icons-material";
import Flex from "../utils/Flex";

interface InfoCardProps {
	title: string;
	description: string;
	createdAt: string;
	imageUrl: string;
	isRead?: boolean;
	onPress?: () => void;
}

const InfoCard = ({
	title,
	description,
	createdAt,
	imageUrl,
	onPress,
}: InfoCardProps) => {
	return (
		<Card
			isPressable
			isHoverable
			shadow="md"
			className="p-3 w-full flex flex-col max-w-full sm:max-w-md mx-auto"
			onPress={onPress}
		>
			<CardHeader className="p-2 pb-0 w-full">
				<Image
					alt={title}
					className="w-full aspect-video object-cover"
					classNames={{
						wrapper: "w-full !max-w-full h-auto",
					}}
					radius="lg"
					src={imageUrl || "/placeholder_img.png"}
				/>
			</CardHeader>
			<CardBody className="flex flex-col gap-2 w-full p-4">
				<Flex
					gap="8px"
					alignItems="center"
					className="text-sm uppercase font-bold tracking-wider"
				>
					<CalendarToday style={{ fontSize: 14 }} />
					{new Date(createdAt).toLocaleDateString("fr-FR", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
				</Flex>
				<h3
					className="text-2xl font-bold text-primary-800 line-clamp-1"
					title={title}
				>
					{title}
				</h3>
				<p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
					{description}
				</p>
			</CardBody>
		</Card>
	);
};

export default InfoCard;
