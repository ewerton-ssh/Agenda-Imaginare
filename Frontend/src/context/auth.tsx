import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { User } from "../types";

type AuthUser = Omit<User, '_id' | 'password' | 'tokenVersion'>;

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  userData: AuthUser | null;
  logIn(email: string, password: string): Promise<boolean>;
  logOut(): Promise<void>;
  register(name: string, email: string, password: string): Promise<boolean>;
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(email: string, code: string, password: string): Promise<boolean>;
  refreshUser(): Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

type Props = {
    children: ReactNode;
};

function AuthProvider({ children }: Props) {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<User | null>(null);

    const navigate = useNavigate();

    const refreshUser = async () => {
        const hasSession = localStorage.getItem("has_session") === "true";
        if (!hasSession) {
            setUserData(null);
            return;
        }
        try {
            const response = await api.get("/api/v1/me");
            setUserData(response.data.user);
        } catch (error) {
            setUserData(null);
            localStorage.removeItem("has_session");
        }
    };

    useEffect(() => {
        (async () => {
            try {
                await refreshUser();
            } catch (error) {
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const logIn = async (
        email: string,
        password: string
    ): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await toast.promise(
                api.post("/api/v1/login", {
                    email,
                    password,
                }),
                {
                    loading: "Entrando...",
                    success: "Logado com sucesso!",
                    error: (err: any) =>
                        err?.response?.data?.error ??
                        err?.response?.data?.message ??
                        "Falha no login.",
                }
            );

            localStorage.setItem("has_session", "true");

            if (response.data?.user) {
                setUserData(response.data.user);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100));
                await refreshUser();
            }

            return true;
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logOut = async () => {
        setLoading(true);
        try {
            await api.post("/api/v1/logout");
        } catch (error) { }
        localStorage.removeItem("has_session");
        setUserData(null);
        setLoading(false);
        navigate("/login");
    };

    const register = async (
        name: string,
        email: string,
        password: string
    ) => {
        try {
            await toast.promise(
                api.post("/api/v1/register", {
                    name,
                    email,
                    password,
                }),
                {
                    loading: "Cadastrando...",
                    success: "Cadastrado com sucesso!",
                    error: (err: any) =>
                        err?.response?.data?.message ??
                        "Erro ao Realizar Cadastro",
                }
            );

            navigate("/login");
            return true;
        } catch (error) {
            return false;
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            await toast.promise(
                api.post("/api/v1/forgotpassword", { email }),
                {
                    loading: "Enviando e-mail de recuperação...",
                    success: "Se o e-mail estiver cadastrado, você receberá o código em instantes.",
                    error: "Não foi possível processar a requisição no momento.",
                }
            );

            return true;
        } catch (error) {
            return false;
        }
    };

    const resetPassword = async (
        email: string,
        code: string,
        password: string
    ) => {
        try {
            await toast.promise(
                api.post("/api/v1/resetpassword", {
                    email,
                    code,
                    password,
                }),
                {
                    loading: "Alterando...",
                    success: "Senha alterada!",
                    error: "Erro.",
                }
            );

            return true;
        } catch (error) {
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                loading,
                userData,
                isAuthenticated: !!userData,
                logIn,
                logOut,
                register,
                forgotPassword,
                resetPassword,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context)
        throw new Error("useAuth must be used within AuthProvider");

    return context;
}