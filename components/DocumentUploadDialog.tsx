"use client";

import React, { useState, useRef } from "react";
import { X, Save, FileText, Loader2, HardDrive, Type, Upload, File as FileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (doc: any) => void;
}

const CATEGORIES = [
    { id: 'planos', label: 'Plano Técnico' },
    { id: 'contratos', label: 'Contrato/Factura' },
    { id: 'materiales', label: 'Lista de Materiales' },
    { id: 'otros', label: 'Otro' }
];

export default function DocumentUploadDialog({ isOpen, onClose, onSuccess }: DocumentUploadDialogProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("otros");
    const [type, setType] = useState("pdf");
    const [size, setSize] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        // Extraer metadatos
        const fileName = file.name.split('.').slice(0, -1).join('.');
        const fileExt = file.name.split('.').pop()?.toLowerCase() || "pdf";
        const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";

        setName(fileName);
        setType(fileExt);
        setSize(fileSize);

        toast.info(`Archivo seleccionado: ${file.name}`);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Por favor, ingresa un nombre para el documento.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSuccess({
                name,
                category,
                type,
                size: size || "0.1 MB",
                url: "#"
            });

            setName("");
            setCategory("otros");
            setSize("");
            onClose();
        } catch (error: any) {
            toast.error("Error al guardar documento");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <HardDrive className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Cargar Activo</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Repositorio Técnico</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group overflow-hidden",
                                    isDragging
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.98]"
                                        : "border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={onFileSelect}
                                />

                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                                    isDragging ? "bg-blue-500 text-white rotate-12 scale-110" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:text-blue-500 group-hover:rotate-3"
                                )}>
                                    {isDragging ? <Upload className="w-8 h-8" /> : (name ? <FileIcon className="w-8 h-8 text-blue-500" /> : <Upload className="w-8 h-8" />)}
                                </div>

                                <div className="text-center">
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                                        {name ? `Archivo: ${name}` : "Arrastra y suelta aquí"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                        o haz click para buscar en tu computadora
                                    </p>
                                </div>

                                {isDragging && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] pointer-events-none flex items-center justify-center"
                                    >
                                        <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] animate-pulse">Soltar ahora</p>
                                    </motion.div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-blue-500" /> Nombre del Documento
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Título identificador..."
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Type className="w-3 h-3 text-blue-500" /> Categoría
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer dark:text-white"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name}
                                    className="flex-[2] py-3.5 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 translate-y-0 hover:-translate-y-1"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                                    {isSubmitting ? "Registrando..." : "Guardar Activo"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
