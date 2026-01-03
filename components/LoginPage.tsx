"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const { loginWithGoogle, isLoading } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 text-center transition-all duration-300">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Zócalo Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Gestión de Obra Profesional</p>
                </div>

                <div className="space-y-6">
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Para acceder a tus proyectos y bitácoras, por favor inicia sesión con tu cuenta de Google.
                    </p>

                    <button
                        onClick={() => loginWithGoogle()}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        Continuar con Google
                    </button>
                </div>

                <div className="mt-12 text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Zócalo Project
                </div>
            </div>
        </div>
    );
}
