"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Hammer,
    LayoutDashboard,
    Kanban,
    CalendarDays,
    Wallet,
    BarChart2,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    PlayCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface LandingPageProps {
    onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">

            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                            <Hammer className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">ZOCALO</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        <a href="#features" className="hover:text-emerald-600 transition-colors">Características</a>
                        <a href="#solutions" className="hover:text-emerald-600 transition-colors">Soluciones</a>
                        <a href="#about" className="hover:text-emerald-600 transition-colors">Nosotros</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-emerald-600/20"
                        >
                            Comenzar gratis
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            Gestión de Proyectos de Arquitectura
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                            Diseña el futuro, <br />
                            <span className="text-emerald-600">gestiona el presente.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            La plataforma integral para arquitectos y constructoras que buscan precisión en sus cronogramas, control financiero absoluto y bitácoras detalladas.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <button
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 group transition-all"
                        >
                            Empezar ahora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <PlayCircle className="w-5 h-5 text-emerald-600" /> Ver demo
                        </button>
                    </motion.div>

                    {/* Mockup Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative mt-20 max-w-5xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl overflow-hidden aspect-video group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex flex-col">
                            {/* Fake UI Header */}
                            <div className="h-12 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded-md max-w-xs" />
                            </div>
                            <div className="flex-1 flex p-6 gap-6">
                                {/* Side Nav */}
                                <div className="w-48 space-y-4 hidden md:block">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center gap-3 px-3">
                                            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded" />
                                            <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded-full w-20" />
                                        </div>
                                    ))}
                                </div>
                                {/* Main Content */}
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50" />
                                        <div className="h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50" />
                                        <div className="h-24 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50" />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">Todo lo que necesitas para <span className="text-emerald-600">tu obra.</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Diseñado por y para arquitectos, eliminando la complejidad de la gestión diaria.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Kanban className="w-10 h-10 text-emerald-600" />}
                            title="Tablero Kanban"
                            description="Organiza tus tareas visualmente. Arrastra y suelta para actualizar el estado de cada etapa de la obra."
                        />
                        <FeatureCard
                            icon={<CalendarDays className="w-10 h-10 text-blue-600" />}
                            title="Cronograma Maestro"
                            description="Visualización estilo Gantt para controlar tiempos, dependencias y evitar retrasos costosos."
                        />
                        <FeatureCard
                            icon={<Wallet className="w-10 h-10 text-amber-600" />}
                            title="Control Financiero"
                            description="Monitorea el presupuesto real vs. estimado en tiempo real. Gestión de gastos y egresos integrada."
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-10 h-10 text-indigo-600" />}
                            title="Bitácora Diaria"
                            description="Registro fotográfico y descriptivo de avances. Genera reportes PDF profesionales para tus clientes."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="w-10 h-10 text-rose-600" />}
                            title="Métricas de Avance"
                            description="Estadísticas detalladas sobre eficiencia, rentabilidad y tiempos de ejecución del proyecto."
                        />
                        <FeatureCard
                            icon={<LayoutDashboard className="w-10 h-10 text-cyan-600" />}
                            title="Multi-Proyecto"
                            description="Administra todas tus obras desde un solo panel centralizado con accesos personalizados."
                        />
                    </div>
                </div>
            </section>

            {/* --- BENEFITS / ASANA STYLE SECTION --- */}
            <section id="solutions" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Menos caos, <br />
                                <span className="text-emerald-600">más arquitectura.</span>
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                                ZOCALO centraliza la comunicación y el seguimiento, permitiéndote enfocarte en lo que realmente importa: el diseño y la calidad constructiva.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 font-semibold">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Actualizaciones en tiempo real para todo el equipo.
                                </li>
                                <li className="flex items-center gap-3 font-semibold">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Exportación de cronogramas a CSV y PDF.
                                </li>
                                <li className="flex items-center gap-3 font-semibold">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Alertas proactivas de retrasos y sobrecostos.
                                </li>
                            </ul>
                            <button
                                onClick={onGetStarted}
                                className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all underline underline-offset-8"
                            >
                                Descubre cómo optimizar tu flujo <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="relative aspect-square md:aspect-video bg-emerald-600/5 rounded-3xl border border-emerald-500/10 flex items-center justify-center p-8 overflow-hidden group">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse" />
                                <div className="relative z-10 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 rotate-2 group-hover:rotate-0 transition-transform duration-500">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                                            <Kanban className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-20 mb-2" />
                                        <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full w-12" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 -rotate-2 group-hover:rotate-0 transition-transform duration-500 translate-y-8">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                                            <Wallet className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-16 mb-2" />
                                        <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full w-24" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                                            <CalendarDays className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-24 mb-2" />
                                        <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full w-16" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 rotate-3 group-hover:rotate-0 transition-transform duration-500 translate-y-8">
                                        <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center mb-4">
                                            <BarChart2 className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-12 mb-2" />
                                        <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full w-20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-emerald-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            ¿Listo para llevar tu obra al siguiente nivel?
                        </h2>
                        <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
                            Únete a cientos de arquitectos que ya transformaron su constructora con ZOCALO.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-black/20"
                        >
                            Comenzar mi primera obra gratis
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                            <Hammer className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-black tracking-tighter">ZOCALO</span>
                    </div>
                    <div className="flex gap-8 text-sm font-semibold text-slate-500">
                        <a href="#" className="hover:text-emerald-600">Privacidad</a>
                        <a href="#" className="hover:text-emerald-600">Términos</a>
                        <a href="#" className="hover:text-emerald-600">Contacto</a>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                        © 2026 Zocalo Project Manager. Hecho con ❤️ para arquitectos.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-black mb-3">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {description}
            </p>
        </div>
    );
}
