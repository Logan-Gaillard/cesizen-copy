"use client";

import { logoutUser } from "@/actions/user";
import { useAuth } from "@/context/AuthContext";
import { Logout, Person } from "@mui/icons-material";

import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import useIsAdmin from "@/context/useIsAdmin";

const UserDropdown = () => {
	const user = useAuth();
	const router = useRouter();
	const isAdmin = useIsAdmin();

	const handleLogout = async () => {
		await logoutUser();
		await user.refreshAuth();
		router.push("/");
	};

	return (
		<Dropdown>
			<DropdownTrigger>
				<User
					as="button"
					className="cursor-pointer transition-all duration-200 text-white font-semibold px-3 py-2 rounded-lg hover:bg-primary-600 hover:scale-105 active:scale-95"
					name={user.data?.nickname || "User"}
					avatarProps={{
						className:
							"bg-gradient-to-br from-secondary-500 to-secondary-700 text-white",
						name: user.data?.nickname || "User",
					}}
				/>
			</DropdownTrigger>
			<DropdownMenu aria-label="User Actions" variant="flat">
				<DropdownItem
					key="profile"
					color="primary"
					startContent={<Person />}
					onPress={() => router.push("/profile")}
				>
					Profile
				</DropdownItem>
				{isAdmin ? (
					<DropdownItem
						key="admin"
						color="primary"
						startContent={<Person />}
						onPress={() => router.push("/admin")}
					>
						Espace Administrateur
					</DropdownItem>
				) : null}

				<DropdownItem
					key="logout"
					color="danger"
					className="text-danger"
					onPress={handleLogout}
					startContent={<Logout />}
				>
					Se déconnecter
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
};

export default UserDropdown;
