"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';

interface User {
    id: string;
    username: string;
    role: 'admin' | 'viewer';
    avatar?: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
                    role: 'admin', // In this version, all logged in users are admins of their own things
                    avatar: firebaseUser.photoURL || undefined,
                    email: firebaseUser.email || undefined
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            toast.success("Sesión iniciada correctamente");
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error("El inicio de sesión fue cancelado");
            } else {
                toast.error("Error al iniciar sesión con Google");
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.info("Sesión cerrada");
        } catch (error) {
            console.error("Error signing out", error);
            toast.error("Error al cerrar sesión");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, isLoading }}>
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
