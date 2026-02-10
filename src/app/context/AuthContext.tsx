import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useWallet } from "@txnlab/use-wallet-react";

interface User {
    _id: string;
    username: string;
    email: string;
    walletAddress?: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { activeAccount } = useWallet();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            setUser({ ...JSON.parse(storedUser), token: storedToken });
        }
    }, []);

    const login = (token: string, userData: any) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser({ ...userData, token });
        toast.success("Welcome back!");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        toast.info("Logged out successfully");
    };

    // Link Wallet Logic (Runs when activeAccount changes and user is logged in)
    useEffect(() => {
        const linkWallet = async () => {
            if (user && activeAccount && user.walletAddress !== activeAccount.address) {
                try {
                    const response = await fetch("http://localhost:8000/api/users/link-wallet", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": user.token
                        },
                        body: JSON.stringify({ walletAddress: activeAccount.address })
                    });
                    const data = await response.json();
                    if (data.success) {
                        toast.success("Wallet Linked Successfully!");
                        // Update local user state
                        const updatedUser = { ...user, walletAddress: activeAccount.address };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        setUser(updatedUser);
                    }
                } catch (error) {
                    console.error("Failed to link wallet", error);
                }
            }
        };
        linkWallet();
    }, [activeAccount, user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
