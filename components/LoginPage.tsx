"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    ShieldCheck,
    ArrowRight,
    Kanban,
    Camera,
    CalendarDays,
    Wallet,
    CheckCircle2,
    BarChart3,
    Clock,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginPageProps {
    onBack?: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
    const { loginWithGoogle, isLoading } = useAuth();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900">
            {/* 1. NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">ZÓCALO</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Volver
                            </button>
                        )}
                        <button
                            onClick={() => loginWithGoogle()}
                            disabled={isLoading}
                            className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            Ingresar
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <section className="pt-40 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                            El futuro de la gestión de obras
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                            Gestiona tus proyectos <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                sin complicaciones.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Zócalo es la plataforma todo-en-uno diseñada para profesionales de la arquitectura y construcción. Planifica, colabora y entrega resultados increíbles.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => loginWithGoogle()}
                                disabled={isLoading}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                                Comenzar ahora con Google
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium">Sin tarjetas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium">Sin instalación</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. FEATURE CARDS */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Kanban className="w-8 h-8 text-blue-500" />}
                            title="Tablero Kanban"
                            description="Visualiza el flujo de trabajo de tu obra. Arrastra y suelta tareas para mantener el ritmo."
                        />
                        <FeatureCard
                            icon={<Camera className="w-8 h-8 text-purple-500" />}
                            title="Bitácora Visual"
                            description="Registra eventos diarios con fotos y descripciones sincronizadas en la nube."
                        />
                        <FeatureCard
                            icon={<CalendarDays className="w-8 h-8 text-emerald-500" />}
                            title="Cronograma Inteligente"
                            description="Planifica fechas y gestiona días de lluvia con ajustes automáticos de cronograma."
                        />
                        <FeatureCard
                            icon={<Wallet className="w-8 h-8 text-orange-500" />}
                            title="Control Financiero"
                            description="Monitorea presupuestos, gastos y métricas de rentabilidad en tiempo real."
                        />
                    </div>
                </div>
            </section>

            {/* 4. CONTENT SECTIONS */}
            <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                                Todo bajo control, <br /> en un solo lugar.
                            </h2>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Métricas en tiempo real</h4>
                                        <p className="text-slate-500 dark:text-slate-400">Analiza el progreso de tus obras con gráficos dinámicos y reportes automáticos.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Ahorro de tiempo diario</h4>
                                        <p className="text-slate-500 dark:text-slate-400">Automatiza la bitácora y los reportes para dedicar más tiempo al diseño y la ejecución.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Colaboración sin fricción</h4>
                                        <p className="text-slate-500 dark:text-slate-400">Invita a clientes y subcontratistas a ver el progreso mediante enlaces directos.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-3xl rounded-full" />
                            <div className="relative bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800">
                                <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
                                    <div className="text-slate-500 text-center">
                                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-medium">Interfaz de Gestión Zócalo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CALL TO ACTION FOOTER */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
                        ¿Listo para profesionalizar tus obras?
                    </h2>
                    <p className="text-xl text-slate-400 mb-10">
                        Únete a los arquitectos que ya están transformando su forma de trabajar con Zócalo.
                    </p>
                    <button
                        onClick={() => loginWithGoogle()}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5 mx-auto"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                        Probar Zócalo Gratis
                    </button>
                    <p className="mt-8 text-slate-500 text-sm">
                        Al registrarte, aceptas nuestros términos y condiciones.
                    </p>
                </div>
            </section>

            {/* 6. SIMPLE FOOTER */}
            <footer className="py-12 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                        <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center text-white">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold tracking-tighter text-slate-500">ZÓCALO</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} Zócalo Project &bull; Hecho con ❤️ para arquitectos
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl shadow-sm hover:shadow-xl transition-all"
        >
            <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-fit">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
