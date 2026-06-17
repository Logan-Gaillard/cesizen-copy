"use client";

import { logoutUser } from "@/actions/user";
import { useAuth } from "@/context/AuthContext";
import { Logout, Person } from "@mui/icons-material";
import { Accordion, AccordionItem, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import useIsAdmin from "@/context/useIsAdmin";

const StyledAccordion = styled(Accordion)`
	width: 100%;
`;

const ItemContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 4px 0;
`;

const MobileButton = styled(Button)`
    width: fit-content;
    justify-content: flex-start !important;
    background-color: transparent !important;
    font-weight: 600;
`;

const UserAccordion = ({
	setIsDropdownOpen,
}: {
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const isAdmin = useIsAdmin();
	const user = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		await logoutUser();
		await user.refreshAuth();
		setIsDropdownOpen(false);
		router.push("/");
	};

	return (
		<StyledAccordion isCompact>
			<AccordionItem
				classNames={{
					title: "text-primary-700 font-semibold ml-2 text-sm",
				}}
				aria-label={user.data?.nickname || "User"}
				title={user.data?.nickname || "User"}
			>
				<ItemContent>
					<MobileButton
						variant="light"
						className={"text-primary-700"}
						type="button"
						onPress={() => {
							setIsDropdownOpen(false);
							router.push("/profile");
						}}
					>
						<Person fontSize="small" />
						Profile
					</MobileButton>
					{isAdmin && (
						<MobileButton
							variant="light"
							className={"text-primary-700"}
							type="button"
							onPress={() => {
								setIsDropdownOpen(false);
								router.push("/admin");
							}}
						>
							<Person fontSize="small" />
							Espace administrateur
						</MobileButton>
					)}
					<MobileButton
						variant="light"
						color="danger"
						type="button"
						onClick={handleLogout}
					>
						<Logout fontSize="small" />
						Se deconnecter
					</MobileButton>
				</ItemContent>
			</AccordionItem>
		</StyledAccordion>
	);
};

export default UserAccordion;
