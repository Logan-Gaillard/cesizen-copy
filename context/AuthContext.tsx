"use client";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { getSessionUser } from "@/libs/user.service";

interface AuthSession {
	nickname: string;
	email: string;
	role: string;
}

// On définit un type pour le contexte qui inclut les données ET la fonction de refresh
interface AuthContextType {
	data: AuthSession | null;
	loading: boolean;
	refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [data, setData] = useState<AuthSession | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshAuth = useCallback(async () => {
		try {
			const session = await getSessionUser();
			setData(session);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		refreshAuth().then(() => {
			if (!isMounted) return;
		});

		return () => {
			isMounted = false;
		};
	}, [refreshAuth]);

	return (
		<AuthContext.Provider value={{ data, loading, refreshAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};
