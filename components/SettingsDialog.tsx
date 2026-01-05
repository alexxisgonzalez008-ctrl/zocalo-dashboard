import React, { useState, useEffect } from "react";
import { X, Save, Type, Building, Download, Upload, AlertTriangle, Wallet, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { ProjectSettings } from "@/lib/types";

interface SettingsDialogProps {
    settings: ProjectSettings;
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: ProjectSettings) => void;
}

export default function SettingsDialog({ settings, isOpen, onClose, onSave }: SettingsDialogProps) {
    const [title, setTitle] = useState(settings.title);
    const [subtitle, setSubtitle] = useState(settings.subtitle);
    const [totalBudget, setTotalBudget] = useState(settings.totalBudget || 0);


    useEffect(() => {
        if (isOpen) {
            setTitle(settings.title);
            setSubtitle(settings.subtitle);
            setTotalBudget(settings.totalBudget || 0);
        }
    }, [isOpen, settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            subtitle,
            totalBudget,
            googleCalendarId: settings.googleCalendarId,
            googleClientId: settings.googleClientId,
            googleApiKey: settings.googleApiKey
        });
        onClose();
    };

    const handleBackup = () => {
        const data = {
            settings: JSON.parse(localStorage.getItem('islara_settings') || '{}'),
            tasks: JSON.parse(localStorage.getItem('islara_tasks') || '[]'),
            logs: JSON.parse(localStorage.getItem('islara_logs') || '[]'),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `islara_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success("Copia de seguridad descargada");
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.settings) localStorage.setItem('islara_settings', JSON.stringify(data.settings));
                if (data.tasks) localStorage.setItem('islara_tasks', JSON.stringify(data.tasks));
                if (data.logs) localStorage.setItem('islara_logs', JSON.stringify(data.logs));

                toast.success("Datos restaurados correctamente");
                window.location.reload();
            } catch (error) {
                toast.error("Archivo de respaldo inválido");
            }
        };
        reader.readAsText(file);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Configuración del Proyecto</h3>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Building className="w-3 h-3" /> Nombre del Proyecto
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: Islara | Funes"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Type className="w-3 h-3" /> Subtítulo / Descripción
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    value={subtitle}
                                    onChange={e => setSubtitle(e.target.value)}
                                    placeholder="Ej: Gestión de Obra"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Wallet className="w-3 h-3" /> Presupuesto Total de Obra
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono italic select-none">$</span>
                                    <input
                                        type="number"
                                        className="w-full p-2 pl-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                                        value={totalBudget}
                                        onChange={e => setTotalBudget(Number(e.target.value))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="mt-8 space-y-4">
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors shadow-lg shadow-slate-900/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        Guardar Cambios
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-4">Zona de Datos</h4>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={handleBackup}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar Backup
                                        </button>
                                        <div className="flex-1 relative">
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleRestore}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <button
                                                type="button"
                                                className="w-full h-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition pointer-events-none"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Restaurar Backup
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-3 text-amber-700 dark:text-amber-400 text-xs">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        <p>Cuidado: "Restaurar" sobrescribirá todos los datos actuales. Asegúrese de tener una copia de seguridad reciente antes de hacerlo.</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
