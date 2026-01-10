"use client";

import React, { useState } from "react";
import { X, Save, Plus, Trash2, Loader2, Package, User, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onSuccess: () => void;
}

interface ItemForm {
    description: string;
    requestedQuantity: number;
    unit: string;
}

export default function OrderCreateDialog({ isOpen, onClose, projectId, onSuccess }: OrderCreateDialogProps) {
    const [vendor, setVendor] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<ItemForm[]>([
        { description: "", requestedQuantity: 0, unit: "unidades" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { description: "", requestedQuantity: 0, unit: "unidades" }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        const invalidItems = items.filter(item => !item.description || item.requestedQuantity <= 0);
        if (invalidItems.length > 0) {
            toast.error("Por favor, completa todos los campos de los ítems con cantidades válidas.");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post("/api/material-orders", {
                projectId,
                vendor,
                notes,
                items: items.map(item => ({
                    description: item.description,
                    requestedQuantity: item.requestedQuantity,
                    unit: item.unit
                }))
            });

            toast.success("Pedido creado correctamente");
            onSuccess();
            onClose();
            // Reset form
            setVendor("");
            setNotes("");
            setItems([{ description: "", requestedQuantity: 0, unit: "unidades" }]);
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast.error("No se pudo crear el pedido: " + (error.response?.data?.error || error.message));
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
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 max-h-[90vh] border dark:border-slate-800 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Nuevo Pedido</h3>
                                    <p className="text-xs text-slate-500 font-medium">Registra una nueva solicitud de materiales</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <User className="w-3 h-3 text-emerald-500" /> Proveedor / Local
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Corralón Don Pedro"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                        value={vendor}
                                        onChange={e => setVendor(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-emerald-500" /> Notas adicionales
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Entrega urgente en portal"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Materiales Solicitados</label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                    >
                                        <Plus className="w-3 h-3" /> Agregar Ítem
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={index}
                                            className="grid grid-cols-12 gap-3 items-end p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                                        >
                                            <div className="col-span-12 md:col-span-6 space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Descripción</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Ej: Cemento Avellaneda"
                                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                    value={item.description}
                                                    onChange={e => updateItem(index, "description", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-6 md:col-span-3 space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Cant.</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0.1"
                                                    step="any"
                                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                    value={item.requestedQuantity || ""}
                                                    onChange={e => updateItem(index, "requestedQuantity", parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Unidad</label>
                                                <input
                                                    type="text"
                                                    placeholder="Unid."
                                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                    value={item.unit}
                                                    onChange={e => updateItem(index, "unit", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1 flex justify-center pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-black text-sm uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-700 font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isSubmitting ? "Guardando..." : "Crear Pedido"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
