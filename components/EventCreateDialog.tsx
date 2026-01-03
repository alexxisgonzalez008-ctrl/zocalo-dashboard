"use client";

import React, { useState } from "react";
import { X, Save, Calendar, Clock, MapPin, Tag, Type, RefreshCw } from "lucide-react";
import { CalendarEventType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: {
        title: string;
        type: CalendarEventType;
        start: string;
        end: string;
        description: string;
        location: string;
        allDay: boolean;
    }) => Promise<void>;
}

const EVENT_TYPES: { value: CalendarEventType; label: string; color: string }[] = [
    { value: "meeting", label: "Reunión de Obra", color: "bg-emerald-500" },
    { value: "milestone", label: "Hito", color: "bg-red-500" },
    { value: "inspection", label: "Inspección", color: "bg-amber-500" },
    { value: "delivery", label: "Entrega Materiales", color: "bg-blue-500" },
];

export default function EventCreateDialog({ isOpen, onClose, onSave }: EventCreateDialogProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<CalendarEventType>("meeting");
    const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState("09:00");
    const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [endTime, setEndTime] = useState("10:00");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("Submit event clicked", title);
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const startStr = allDay ? startDate : `${startDate}T${startTime}:00`;
            const endStr = allDay ? endDate : `${endDate}T${endTime}:00`;

            await onSave({
                title,
                type,
                start: startStr,
                end: endStr,
                description,
                location,
                allDay,
            });
            onClose();
            // Reset form
            setTitle("");
            setLocation("");
            setDescription("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                    key="calendar-event-dialog"
                >
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
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 max-h-[90vh] border dark:border-slate-800 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">Nuevo Evento</h3>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Type className="w-3 h-3" /> Título del Evento
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Reunión con el capataz"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Tipo de Evento
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {EVENT_TYPES.map(t => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setType(t.value)}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all",
                                                type === t.value
                                                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md"
                                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full", t.color)} />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex-1">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Todo el día
                                    </label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={allDay}
                                        onChange={e => setAllDay(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Inicio
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                    {!allDay && (
                                        <input
                                            type="time"
                                            className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={startTime}
                                            onChange={e => setStartTime(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Fin
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                    {!allDay && (
                                        <input
                                            type="time"
                                            className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={endTime}
                                            onChange={e => setEndTime(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Ubicación
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Obra Islara - Lote 45"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Notas Adicionales</label>
                                <textarea
                                    placeholder="Detalles importantes del evento..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px]"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isSubmitting ? "Guardando..." : "Crear Evento"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
