"use client";

import React, { useState } from 'react';
import { Copy, Check, Share2, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
}

export default function ShareDialog({ isOpen, onClose, projectId, projectName }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const inviteLink = typeof window !== 'undefined'
        ? `${window.location.origin}?invite=${projectId}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Enlace de invitación copiado");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-emerald-500" />
                                Compartir Proyecto
                            </h2>
                            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Cualquier persona con este enlace podrá unirse a la obra **{projectName}**.
                            </p>

                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <input
                                            readOnly
                                            value={inviteLink}
                                            className="bg-transparent border-none text-xs w-full outline-none text-slate-600 dark:text-slate-300 pointer-events-none truncate"
                                        />
                                    </div>
                                </div>
                                <button
                                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">Permisos</h4>
                                <p className="text-xs text-blue-600 dark:text-blue-300">
                                    Los invitados tendrán acceso de **Editor** para colaborar en tareas y bitácora. Solo tú como dueño puedes borrar el proyecto.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Listo
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
