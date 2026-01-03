"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Lock, User } from 'lucide-react';

export default function LoginPage() {
    const { login, loginWithGoogle } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(username, password);
    };

    useEffect(() => {
        // Initialize Google Sign-In button
        if (typeof window !== 'undefined' && (window as any).google) {
            const google = (window as any).google;
            google.accounts.id.initialize({
                client_id: "97657199919-7bfssfqpffk5hgmkb7hdi7m98b05v3uk.apps.googleusercontent.com", // Placeholder
                callback: (response: any) => {
                    loginWithGoogle(response.credential);
                },
            });

            if (googleButtonRef.current) {
                google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    shape: "rectangular",
                    width: "100%",
                });
            }
        }
    }, [loginWithGoogle]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Zócalo Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Acceso Seguro Requerido</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Usuario
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white transition-all outline-none"
                                placeholder="ej. admin"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                    >
                        Ingresar al Sistema
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-800 px-4 text-slate-500 dark:text-slate-400 font-medium">O continuar con</span>
                        </div>
                    </div>

                    <div className="w-full flex justify-center" ref={googleButtonRef}>
                        {/* Google Button renders here */}
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 mt-2">
                            Credenciales locales: admin / admin123
                        </p>
                    </div>
                </form>

                <div className="mt-8 text-center text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Zócalo Project
                </div>
            </div>
        </div>
    );
}
