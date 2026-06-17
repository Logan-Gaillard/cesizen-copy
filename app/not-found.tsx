"use client";

import { Button } from "@heroui/react";
import Flex from "./components/utils/Flex";

const NotFound = () => {
	return (
		<Flex direction="column" gap justifyContent="center" alignItems="center">
			<h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
			<p className="text-lg text-gray-600">
				Désolé, la page que vous recherchez n'existe pas.
			</p>
			<Button
				variant="shadow"
				color="primary"
				onPress={() => window.history.back()}
			>
				Retour à la page précédente
			</Button>
		</Flex>
	);
};

export default NotFound;
