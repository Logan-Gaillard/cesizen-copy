"use client";
import useIsMobile from "@/context/useIsMobile";
import Flex from "../components/utils/Flex";
import Title from "../components/utils/Title";
import InfoCard from "../components/Infos/InfoCard";
import { useRouter } from "next/navigation";
import useInformations from "@/context/useInformations";

const Actu = () => {
	const router = useRouter();
	const isMobile = useIsMobile();
	const { informations } = useInformations();

	return (
		<Flex
			direction="column"
			gap
			justifyContent="center"
			alignItems="baseline"
			className="max-w-6xl mx-auto w-full"
		>
			<Title size="lg">Actualités & Conseils</Title>
			<p className="text-lg text-gray-600">
				Voici les dernières actualités et conseils pour vous aider à mieux gérer
				votre santé mentale pendant vos études.
			</p>

			<Flex
				flexWrap="wrap"
				gap="24px"
				justifyContent="flex-start"
				alignItems="center"
				alignContent="flex-start"
				fullWidth
			>
				{Object.values(informations).map((info) => (
					<InfoCard
						key={info.id}
						title={info.title}
						description={info.description}
						createdAt={info.createdAt || ""}
						imageUrl={info.imageURL}
						onPress={() => router.push(`/actu/${info.id}`)}
					/>
				))}
			</Flex>
		</Flex>
	);
};

export default Actu;
