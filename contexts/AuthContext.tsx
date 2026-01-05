"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider
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
    googleAccessToken: string | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('google_access_token');
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    // Sync token with sessionStorage
    useEffect(() => {
        if (googleAccessToken) {
            sessionStorage.setItem('google_access_token', googleAccessToken);
        } else {
            sessionStorage.removeItem('google_access_token');
        }
    }, [googleAccessToken]);

    useEffect(() => {
        // Handle redirect result
        getRedirectResult(auth).then((result) => {
            if (result) {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential) {
                    setGoogleAccessToken(credential.accessToken || null);
                }
                toast.success("Sesión iniciada correctamente");
            }
        }).catch((error: any) => {
            console.error("Error getting redirect result", error);
            // Don't show toast for every page load, only if it's a real auth error
            if (error.code && error.code !== 'auth/popup-closed-by-user') {
                toast.error(`Error de autenticación: ${error.message}`);
            }
        });

        // Safety timeout: don't stay loading forever (max 10 seconds)
        const safetyTimeout = setTimeout(() => {
            if (isLoading) {
                console.warn("Auth initialization taking too long, forcing loading to false");
                setIsLoading(false);
            }
        }, 10000);

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            console.log("Auth state changed:", firebaseUser ? "User found" : "No user");
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
                    role: 'admin',
                    avatar: firebaseUser.photoURL || undefined,
                    email: firebaseUser.email || undefined
                });
            } else {
                setUser(null);
                setGoogleAccessToken(null);
            }
            setIsLoading(false);
            clearTimeout(safetyTimeout);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            // Use redirect for mobile devices, popup for desktop
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                (typeof window !== 'undefined' && window.innerWidth < 768);

            if (isMobile) {
                await signInWithRedirect(auth, googleProvider);
            } else {
                const result = await signInWithPopup(auth, googleProvider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential) {
                    setGoogleAccessToken(credential.accessToken || null);
                }
                toast.success("Sesión iniciada correctamente");
            }
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            setIsLoading(false);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error("El inicio de sesión fue cancelado");
            } else if (error.code === 'auth/popup-blocked') {
                toast.error("El navegador bloqueó la ventana. Intentando otro método...");
                await signInWithRedirect(auth, googleProvider);
            } else if (error.code === 'auth/unauthorized-domain') {
                toast.error("Este dominio no está autorizado en Firebase. Configura 'localhost' o tu dominio en la consola de Firebase.");
            } else {
                toast.error(`Error al iniciar sesión: ${error.message || 'Error desconocido'}`);
            }
        }
    };

    const logout = async () => {
        try {
            sessionStorage.removeItem('google_access_token');
            await signOut(auth);
            toast.info("Sesión cerrada");
        } catch (error) {
            console.error("Error signing out", error);
            toast.error("Error al cerrar sesión");
        }
    };

    return (
        <AuthContext.Provider value={{ user, googleAccessToken, loginWithGoogle, logout, isLoading }}>
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
