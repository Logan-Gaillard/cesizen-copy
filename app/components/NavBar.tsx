"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import styled, { StyleSheetManager } from "styled-components";
import UserDropdown from "./NavBar/UserDropdown";
import useIsMobile from "../../context/useIsMobile";
import { useState } from "react";
import { Close, Login, Menu } from "@mui/icons-material";
import UserAccordion from "./NavBar/UserAccordion";
import useIsAdmin from "@/context/useIsAdmin";

const NavContainer = styled.nav`
    width: 100%;
    height: 80px;
    background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: sticky;
    top: 0;
    z-index: 50;
`;

const Logo = styled.span`
    font-size: var(--text-2xl);
    font-weight: bold;
    color: white;
    letter-spacing: 2px;
    cursor: pointer;
    transition: transform 0.3s ease, text-shadow 0.3s ease;

    &:hover {
        transform: scale(1.05);
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }

    &:hover .green {
        color: var(--color-primary-200);
    }

    &:hover .yellow {
        color: var(--color-secondary-200);
    }
`;

const NavLinks = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
`;

const NavButton = styled(Button)`
    background-color: transparent !important;
    color: white;
    font-weight: 600;
    position: relative;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;

    &:hover {
        background-color: var(--color-primary-700) !important;
        border-bottom: 2px solid var(--color-primary-600) ;
    }
`;

const LoginButton = styled(Button)`
    background-color: white !important;
    color: var(--color-primary-500);
    font-weight: bold;
    padding: 0 24px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--color-primary-100) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
    }
`;

const IconButton = styled(Button)`
    background-color: transparent !important;
    color: white;
    min-width: auto !important;
    padding: 8px !important;
`;

const MobileActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const MobileMenu = styled.div<{ $open: boolean }>`
    position: absolute;
    top: 100%;
    right: 0;
    width: 100%;
    background: white;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
    padding: 12px;
    display: ${({ $open }) => ($open ? "flex" : "none")};
    flex-direction: column;
    gap: 8px;
    z-index: 60;
`;

const MobileButton = styled(Button)`
    width: 100%;
    justify-content: flex-start !important;
    background-color: transparent !important;
    color: var(--color-primary-700);
    font-weight: 600;
`;

const NavBar = () => {
	const router = useRouter();
	const user = useAuth();
	const isMobile = useIsMobile();
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<StyleSheetManager>
			<NavContainer>
				<Logo onClick={() => router.push("/")}>
					<span className="green">CESI</span>
					<span className="yellow">ZEN</span>
				</Logo>

				{isMobile ? (
					<MobileActions>
						<IconButton
							isIconOnly
							variant="light"
							onPress={() => setMenuOpen((open) => !open)}
						>
							{menuOpen ? <Close /> : <Menu />}
						</IconButton>
						<MobileMenu $open={menuOpen}>
							<MobileButton
								variant="light"
								onPress={() => {
									setMenuOpen(false);
									router.push("/");
								}}
							>
								Accueil
							</MobileButton>
							<MobileButton
								variant="light"
								onPress={() => {
									setMenuOpen(false);
									router.push("/actus");
								}}
							>
								Actualités
							</MobileButton>
							{user.data && (
								<MobileButton
									variant="light"
									onPress={() => {
										setMenuOpen(false);
										router.push("/exercices");
									}}
								>
									Exercices
								</MobileButton>
							)}
							{!user.data && (
								<MobileButton
									variant="light"
									startContent={<Login />}
									onPress={() => {
										setMenuOpen(false);
										router.push("/login");
									}}
								>
									Se connecter
								</MobileButton>
							)}

							{user.data && <UserAccordion setIsDropdownOpen={setMenuOpen} />}
						</MobileMenu>
					</MobileActions>
				) : (
					<NavLinks>
						<NavButton variant="light" onPress={() => router.push("/")}>
							Accueil
						</NavButton>
						<NavButton variant="light" onPress={() => router.push("/actus")}>
							Actualités
						</NavButton>
						{user.data && (
							<>
								<NavButton
									variant="light"
									onPress={() => router.push("/exercices")}
								>
									Exercices
								</NavButton>
								<UserDropdown />
							</>
						)}

						{!user.data && (
							<LoginButton variant="flat" onPress={() => router.push("/login")}>
								Se connecter
							</LoginButton>
						)}
					</NavLinks>
				)}
			</NavContainer>
		</StyleSheetManager>
	);
};

export default NavBar;
