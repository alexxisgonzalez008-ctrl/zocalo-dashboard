"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
    id: string;
    username: string;
    role: 'admin' | 'viewer';
    avatar?: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password?: string) => void;
    loginWithGoogle: (credential: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK CREDENTIALS STORE (Backwards compatibility)
const USERS = {
    'admin': { pass: 'admin123', role: 'admin' },
    'invitado': { pass: 'guest123', role: 'viewer' }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load Google script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            // Optional: clean up script if needed, though usually fine to keep
        };
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('zocalo_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
                localStorage.removeItem('zocalo_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (username: string, password?: string) => {
        if (!username.trim() || !password?.trim()) {
            toast.error("Usuario y contraseña requeridos");
            return;
        }

        const lowerUser = username.toLowerCase().trim();
        const validUser = USERS[lowerUser as keyof typeof USERS];

        if (!validUser) {
            toast.error("Usuario no encontrado");
            return;
        }

        if (validUser.pass !== password) {
            toast.error("Contraseña incorrecta");
            return;
        }

        const newUser: User = {
            id: `usr_${lowerUser}`,
            username: lowerUser,
            role: validUser.role as 'admin' | 'viewer'
        };

        setUser(newUser);
        localStorage.setItem('zocalo_user', JSON.stringify(newUser));
        toast.success(`Bienvenido, ${username}`);
    };

    const loginWithGoogle = (credential: string) => {
        try {
            // Decode JWT (Google ID Token)
            // Simplified decoding for client-side (no verification here as this is a local dashboard)
            const payload = JSON.parse(atob(credential.split('.')[1]));

            const newUser: User = {
                id: `gg_${payload.sub}`,
                username: payload.given_name || payload.name,
                role: 'admin', // Defaulting to admin for Google users in this context
                avatar: payload.picture,
                email: payload.email
            };

            setUser(newUser);
            localStorage.setItem('zocalo_user', JSON.stringify(newUser));
            toast.success(`Bienvenido, ${newUser.username}`);
        } catch (error) {
            console.error("Error decoding Google credential", error);
            toast.error("Error al iniciar sesión con Google");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('zocalo_user');
        toast.info("Sesión cerrada");
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
